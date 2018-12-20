import Timer = NodeJS.Timer;

class BackgroundWorker {

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

  constructor() {
  }

  start() {
    const msInterval = process.env.NODE_ENV === 'development'
      ? 1000 * 20 // 20 seconds
      : 1000 * 60 * 15; // 15 minutes (strava rate limit)

    const callback = () => {
      if (!this.isWorking) {
        // do async work here

        this.DoWork();

        this.isWorking = true;
      } else {
        console.log('still working on the last one');
      }
    };

    setTimeout(() => callback(), 5000); // invoke immediately
    this._interval = setInterval(callback, msInterval);
  }

  async DoWork(): Promise<void> {
    console.log('burning CPU baby');
  }
}

const worker = new BackgroundWorker();
worker.start();