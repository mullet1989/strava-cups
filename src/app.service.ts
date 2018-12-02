import { Injectable } from '@nestjs/common';
import { AthleteService } from './athlete/athlete.service';
import { Activity } from './entity/activity.entity';
import { Athlete } from './entity/athlete.entity';

@Injectable()
export class AppService {

  private _isWorking: boolean = false;
  private _startedWorkingTime: Date = new Date();

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
  ) {
    setInterval(() => {
      if (!this.isWorking) {
        this.printAthleteAsync();
        this.isWorking = true;
      } else {
        console.log("still working on the last one")
      }
    }, 1000 * 30);
  }

  async printAthleteAsync() {
    let athleteId = 687997;
    let athlete: Athlete = await this.athleteService.getOne(athleteId);
    let complete: boolean = false;

    let page: number = 1;
    while (!complete && page < 5) {
      let activities = await this.athleteService.getActivitiesAsync(athlete, page);
      await this.athleteService.saveActivitiesAsync(activities);
      page += 1;
    }
    this.isWorking = false;
  }

}
