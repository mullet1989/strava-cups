import { Injectable } from '@nestjs/common';


@Injectable()
export class RatesService {

  public fifteenCalls: number;
  public dayCalls: number;

  private _interval: number;
  get interval() {
    return this._interval;
  }

  set interval(value: number) {
    console.log(`interval was reset to ${value}`);
    this._interval = value;
  }

  public static FifteenRate: number = 600;
  public static DayRate: number = 300;

  constructor() {
    this.fifteenCalls = 0;
    this.dayCalls = 0;

    this._interval = 1000 * 30; // 30 seconds
  }


}