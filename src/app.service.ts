import { Injectable } from '@nestjs/common';
import { AthleteService } from './athlete/athlete.service';
import { Athlete } from './entity/athlete.entity';
import Timer = NodeJS.Timer;
import { ConfigService } from './config/config.service';
import { Activity } from './entity/activity.entity';

@Injectable()
export class AppService {

  private _isWorking: boolean = false;
  private _startedWorkingTime: Date = new Date();
  private _interval: Timer;

  get isWorking() {
    return this._isWorking;
  }

  set isWorking(value: boolean) {
    if (value) {
      console.log('working now');
      this._startedWorkingTime = new Date();
    } else {
      let dateDiff = new Date().getTime() - this._startedWorkingTime.getTime();
      console.log(`stopped working, time taken: ${dateDiff}`);
    }
    this._isWorking = value;
  }

  constructor(
    private readonly athleteService: AthleteService,
    private readonly configService: ConfigService,
  ) {
    let shouldFetch: boolean = this.configService.get('BACKGROUND_COLLECT') === 'true';
    if (!shouldFetch) {
      return;
    }

    const msInterval = process.env.NODE_ENV === 'development'
      ? 1000 * 20 // 20 seconds
      : 1000 * 60 * 15; // 15 minutes (strava rate limit)

    const callback = () => {
      if (!this.isWorking) {
        this.printAthleteAsync();
        this.isWorking = true;
      } else {
        console.log('still working on the last one');
      }
    };

    setTimeout(() => callback(), 5000); // invoke immediately
    this._interval = setInterval(callback, msInterval);
  }

  async printAthleteAsync() {

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
    } catch (e) {
      clearTimeout(this._interval); // stop working
      console.log(e.message);
    } finally {
      this.isWorking = false;
    }
  }

}
