import { Injectable } from '@nestjs/common';
import { AthleteService } from './athlete/athlete.service';
import { Athlete } from './entity/athlete.entity';
import Timer = NodeJS.Timer;
import { ConfigService } from './config/config.service';
import { Activity } from './entity/activity.entity';
import { AuthService } from './authentication/auth.service';
import { RatesService } from './rates/rates.service';

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
      console.log('still working on the last one');
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
    let complete: boolean = false;

    try {
      for (let athlete of athletes) {
        let page: number = 1;
        let latestActivities: Activity[] = await this.athleteService.getDbActivitiesAsync(athlete, 1);
        let lastTime = (latestActivities && latestActivities.length) ? latestActivities[0].start_date : new Date('1970-01-01');
        while (!complete && page < 5) {
          let activities = await this.athleteService.getActivitiesAsync(athlete, page, lastTime);
          if (activities.length) {
            await this.athleteService.saveActivitiesAsync(activities);
            page += 1;
          } else {
            break;
          }
        }
      }
      this.isWorking = false;
      // queue another one
      this._timeout = setTimeout(this.callback, this.rateService.interval);
    } catch (e) {
      clearTimeout(this._timeout); // stop working
      console.log(e.message);
      this.isWorking = false;
    }
  }

}
