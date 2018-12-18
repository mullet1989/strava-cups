import { HttpService, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Athlete } from '../entity/athlete.entity';
import { Repository } from 'typeorm';
import { AxiosRequestConfig } from 'axios';
import { AthleteAccessToken } from '../entity/athlete.accesstoken.entity';
import { catchError, map } from 'rxjs/operators';
import { Activity } from '../entity/activity.entity';
import { of, throwError } from 'rxjs';
import { StravaBody } from '../strava/strava.models';
import { ConfigService } from '../config/config.service';
import * as _ from 'lodash';

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
    private readonly _http: HttpService,
    private readonly _configService: ConfigService,
  ) {
    console.log('athlete service constructor');
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
        await this.activityRepository.insert(a);
      } catch (e) {
        let error: Error = e;
        console.log(error.message);
      }
    }
  }

  async getDbActivitiesAsync(athlete: Athlete, number: number = 1): Promise<Activity[]> {
    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.athlete_id=:id', { id: athlete.id })
      .orderBy('activity.start_date', 'DESC')
      .limit(number)
      .getMany();
  }

  async getActivitiesAsync(athlete: Athlete, page: number = 1, date?: Date): Promise<Activity[]> {

    let latestToken = _.minBy(athlete.access_tokens, 'create_datetime') || new AthleteAccessToken();

    // new token if the old one is expired
    if (latestToken.isExpired) {
      latestToken = await this.refreshTokenAsync(athlete);
    }

    let config: AxiosRequestConfig = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${latestToken.access_token}`,
      },
    };

    let url = `${this.BaseUrl}/athlete/activities?page=${page}`;
    if (date) {
      // add date if it was passed optionally
      url += `&after=${Math.round(date.getTime() / 1000)}`;
    }
    let activities: any = await this._http.get<Activity[]>(url, config)
      .pipe(
        map(resp => resp.data),
        catchError(err => throwError(err)),
        map<any[], Activity[]>((activities: any[]) => {
          let as = new Array<Activity>();
          for (let activity of activities) {
            if (activity.type !== 'Run') {
              continue;
            }
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
    const refresh_token: string = athlete.latest_token ? athlete.latest_token.access_token : '';
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
        catchError(err => {
          console.log(err); // log error and return empty response
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

}