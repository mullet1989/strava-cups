import { Injectable } from '@nestjs/common';
import { AthleteService } from './athlete/athlete.service';
import { Athlete } from './entity/athlete.entity';
import Timer = NodeJS.Timer;
import { ConfigService } from './config/config.service';
import { Activity } from './entity/activity.entity';
import { AuthService } from './authentication/auth.service';
import { RatesService } from './rates/rates.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { run } from 'tslint/lib/runner';
import { first } from 'rxjs/operators';

@Injectable()
export class AppService {

  private _isWorking: boolean = false;
  private _startedWorkingTime: Date = new Date();
  private _timeout: Timer;

  get isWorking() {
    return this._isWorking;
  }

  set isWorking(value: boolean) {
    if (value) {
      console.log(`START: ${new Date().toISOString()}`);
      this._startedWorkingTime = new Date();
    } else {
      let dateDiff = new Date().getTime() - this._startedWorkingTime.getTime();
      console.log(`STOP: ${new Date().toISOString()} -> ${dateDiff}ms`);
    }
    this._isWorking = value;
  }

  private callback = () => {
    if (!this.isWorking) {
      this.getActivities();
      this.isWorking = true;
    } else {
      console.log('WORK IN PROGRESS');
    }
  };

  constructor(
    private readonly athleteService: AthleteService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly rateService: RatesService,
  ) {
    let shouldFetch: boolean = this.configService.get('BACKGROUND_COLLECT') === 'true';
    if (!shouldFetch) {
      return;
    }

    this._timeout = setTimeout(this.callback, this.rateService.interval);
  }

  async getActivities() {

    let athletes: Athlete[] = await this.athleteService.getAll();

    for (let athlete of athletes) {
      let latestActivities: Activity[] = await this.athleteService.getDbActivitiesAsync(athlete, 1);

      let lastTime =
        (latestActivities && latestActivities.length)
          ? moment(latestActivities[0].start_date).add(-2, 'w').toDate() // 2 weeks back
          : new Date('1970-01-01');

      let page: number = 1;
      const pageSize: number = 100;
      while (page < 12) {
        try {
          let activities = await this.athleteService.getActivitiesAsync(athlete, page, lastTime, pageSize);
          if (activities.length) {
            // get everything and then filter runs here
            const runs = _.filter(activities, { 'type': 'Run' });
            await this.athleteService.saveActivitiesAsync(runs);

            if (activities.length < pageSize) {
              // got everything already
              break;
            }

            page += 1;
          } else {
            break;
          }
        } catch (e) {
          console.log(e.message);
        }
      }
    }
    this.isWorking = false;
    // queue another one
    this._timeout = setTimeout(this.callback, this.rateService.interval);
  }

}
