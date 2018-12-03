import { HttpService, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Athlete } from '../entity/athlete.entity';
import { Repository } from 'typeorm';
import { AxiosRequestConfig } from 'axios';
import { AthleteAccessToken } from '../entity/athlete.accesstoken.entity';
import { catchError, map } from 'rxjs/operators';
import { Activity } from '../entity/activity.entity';
import { of, throwError } from 'rxjs';

@Injectable()
export class AthleteService {

  public readonly BaseUrl: string = 'https://www.strava.com/api/v3';

  constructor(
    @InjectRepository(Athlete)
    private readonly athleteRepository: Repository<Athlete>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly _http: HttpService,
  ) {
    console.log('athlete service constructor');
    // setInterval(() => console.log('background work'), 1000);
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

  async getLatestDbActivityAsync(athlete: Athlete): Promise<Activity> {
    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.athlete_id=:id', { id: athlete.id })
      .orderBy('activity.start_date', 'DESC')
      .getOne();
  }

  async getActivitiesAsync(athlete: Athlete, page: number = 1, date?: Date): Promise<Activity[]> {
    let sortedTokens: AthleteAccessToken[] = athlete.access_tokens
      .sort((a: AthleteAccessToken, b: AthleteAccessToken) => {
        if (a.create_datetime < b.create_datetime) {
          return 1;
        }
        return -1;
      });

    let latestToken = (sortedTokens.length) ? sortedTokens[0] : new AthleteAccessToken();
    let config: AxiosRequestConfig = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${latestToken.access_token}`,
      },
    };

    let url = `${this.BaseUrl}/athlete/activities?page=${page}`;
    if (date) {
      // add date if it was passed optionally
      url += `&after=${Math.round(date.getTime() / 1000)}`
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


}