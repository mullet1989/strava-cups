import { Injectable } from '@nestjs/common';
import { AthleteService } from './athlete/athlete.service';
import { Athlete } from './entity/athlete.entity';
import Timer = NodeJS.Timer;
import { ConfigService } from './config/config.service';

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
    private readonly configService: ConfigService
  ) {
    let shouldFetch: boolean = this.configService.get("BACKGROUND_COLLECT") === "true";
    if (!shouldFetch) {
      return;
    }

    this._interval = setInterval(() => {
      if (!this.isWorking) {
        this.printAthleteAsync();
        this.isWorking = true;
      } else {
        console.log('still working on the last one');
      }
    }, 1000 * 5);
  }

  async printAthleteAsync() {

    let athletes: Athlete[] = await this.athleteService.getAll();
    let complete: boolean = false;

    try {
      for (let athlete of athletes) {
        let page: number = 1;
        let latestActivity = await this.athleteService.getLatestDbActivityAsync(athlete);
        let lastTime = latestActivity ? latestActivity.start_date : new Date('1970-01-01');
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
