import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Athlete } from '../entity/athlete.entity';
import { Repository } from 'typeorm';
import { AxiosRequestConfig } from 'axios';
import { AthleteAccessToken } from '../entity/athlete.accesstoken.entity';
import { catchError, map, tap } from 'rxjs/operators';
import { Activity } from '../entity/activity.entity';
import { of, throwError } from 'rxjs';
import { StravaBody } from '../strava/strava.models';
import { ConfigService } from '../config/config.service';
import * as _ from 'lodash';
import { HttpClient } from './http.client';
import { getConnection, getManager } from 'typeorm';
import { AthleteSummaryModel } from './athlete.summary.model';

@Injectable()
export class AthleteService {

  public readonly BaseUrl: string = 'https://www.strava.com/api/v3';

  constructor(
    @InjectRepository(Athlete)
    private readonly athleteRepository: Repository<Athlete>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(AthleteAccessToken)
    private readonly accessTokenRepository: Repository<AthleteAccessToken>,
    private readonly _http: HttpClient,
    private readonly _configService: ConfigService,
  ) {

  }

  getAll(): Promise<Athlete[]> {
    return this.athleteRepository.find();
  }

  getOne(id: number): Promise<Athlete> {
    return this.athleteRepository.findOne({ athlete_id: id });
  }

  insert(athlete: Athlete): Promise<Athlete> {
    return this.athleteRepository.save(athlete);
  }

  async saveActivitiesAsync(activities: Activity[]): Promise<void> {
    // insert to the database
    for (let a of activities) {
      try {
        let dba = await this.activityRepository.findOne({ id: a.id });
        if (dba) {
          await getConnection()
            .createQueryBuilder()
            .update(Activity)
            .set({
              kudos_count: a.kudos_count,
              comment_count: a.comment_count,
              achievement_count: a.achievement_count,
              average_speed: a.average_speed,
              athlete_count: a.athlete_count,
            })
            .where('id = :id', { id: dba.id })
            .execute();
        } else {
          await this.activityRepository.insert(a);
        }
      } catch (e) {
        let error: Error = e;
        console.log(error.message);
      }
    }
  }

  async getDbActivitiesAsync(athlete: Athlete, number: number = 2147483647): Promise<Activity[]> {
    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.athlete_id=:id', { id: athlete.id })
      .orderBy('activity.start_date', 'DESC')
      .limit(number)
      .getMany();
  }

  async getActivitiesAsync(athlete: Athlete, page: number = 1, date?: Date, perPage: number = 30)
    : Promise<Activity[]> {

    let latestToken: AthleteAccessToken = _.maxBy(athlete.access_tokens, 'create_datetime');
    if (latestToken.isExpired) {

      console.log(`refreshing token for ${athlete.first_name} ${athlete.last_name}`);
      let tkn = await this.refreshTokenAsync(athlete);
      latestToken = tkn;

    }

    let config: AxiosRequestConfig = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${latestToken.access_token}`,
      },
    };

    let url = `${this.BaseUrl}/athlete/activities?page=${page}&per_page=${perPage}`;
    if (date) {
      // add date if it was passed optionally
      url += `&after=${Math.round(date.getTime() / 1000)}`;
    }

    let activities: any = await this._http.get<Activity[]>(url, config)
      .pipe(
        map(resp => resp.data),
        catchError(err => {
          console.log(err.message);
          return of(new Array<Activity>());
        }),
        map<any[], Activity[]>((activities: any[]) => {
          let as = new Array<Activity>();
          for (let activity of activities) {
            let a = new Activity();
            a.id = activity.id;
            a.athlete = new Athlete();
            a.athlete.id = athlete.id;
            a.name = activity.name;
            a.distance = activity.distance;
            a.type = activity.type;
            a.start_date = activity.start_date;
            a.achievement_count = activity.achievement_count;
            a.kudos_count = activity.kudos_count;
            a.comment_count = activity.comment_count;
            a.athlete_count = activity.athlete_count;
            a.average_speed = activity.average_speed;
            as.push(a);
          }
          return as;
        }),
      ).toPromise();

    // save to the db
    // await this.saveActivitiesAsync(activities);

    return activities;
  }


  async refreshTokenAsync(athlete: Athlete): Promise<AthleteAccessToken> {
    const url: string = `https://www.strava.com/oauth/token`;
    const grant_type: string = 'refresh_token';
    const refresh_token: string = athlete.latest_token ? athlete.latest_token.refresh_token : '';
    const client_id: string = this._configService.get('CLIENT_ID');
    const client_secret: string = this._configService.get('CLIENT_SECRET');

    const newAccessToken = await this._http.post<StravaBody>(url,
      {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': grant_type,
        'refresh_token': refresh_token,
      })
      .pipe(
        map(response => response.data),
        catchError(msg => {
          console.log(msg.data.errors); // log error and return empty response
          return of(new StravaBody());
        }),
      )
      .toPromise();

    let accessToken = new AthleteAccessToken();
    accessToken.access_token = newAccessToken.access_token;
    accessToken.refresh_token = newAccessToken.refresh_token;
    accessToken.athlete = athlete;
    accessToken.create_datetime = new Date();
    accessToken.expires_datetime = new Date(newAccessToken.expires_at * 1000);
    await this.accessTokenRepository.insert(accessToken);

    return accessToken;
  }

  async getTopMetricForAthletes(field: string): Promise<any> {
    const manager = getManager();
    const results: AthleteSummaryModel[] = await manager.query(`select a.athlete_id,
                                                                       a.name,
                                                                       a.id,
                                                                       a.val
                                                                from
                                                                  (
                                                                    select a2.athlete_id as athlete_id,
                                                                           ${field}   as "val",
                                                                           a.name as name,
                                                                           a.id as id,
                                                                           ROW_NUMBER()     over
                                                                           (
                                                                             partition by a.athlete_id
                                                                               order by ${field} desc
                                                                             ) as row_num
                                                                    from activity a
                                                                           join athlete a2 on a.athlete_id = a2.id
                                                                    ) as a
                                                                where a.row_num = 1
                                                                order by a.val desc
    `);

    return results.reduce((map, obj) => {
      map[obj.athlete_id] = {
        val: obj.val,
        name: obj.name,
        id: obj.id,
      };
      return map;
    }, {});
  }

  async getAthleteTotalRuns(): Promise<any> {
    const manager = getManager();
    const results: AthleteSummaryModel[] = await manager.query(`select a2.athlete_id,
                                                                       count(1) as "val"
                                                                from activity a
                                                                       join athlete a2 on a.athlete_id = a2.id
                                                                group by a2.athlete_id, first_name, last_name
                                                                order by count(1) desc`);

    return results.reduce((map, obj) => {
      map[obj.athlete_id] = obj.val;
      return map;
    }, {});
  }

}