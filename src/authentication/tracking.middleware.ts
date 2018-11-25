import { Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';
import { AthleteService } from '../athlete/athlete.service';

@Injectable()
export class TrackingMiddleware implements NestMiddleware {

  constructor(private readonly _athlete: AthleteService) {

  }

  async resolve(): Promise<MiddlewareFunction> {
    return (async (req, res, next) => {
      let anon = req.cookies.a;
      if (!anon) {
        let someDate = new Date();
        let numberOfDaysToAdd = 365;
        someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
        res.cookie('a', this.guid(), { expires: someDate, httpOnly: true });
      } else {
        // nothing to do!
      }

      let athlete = await this._athlete.getOne(687997);
      if (athlete) {
        console.log(athlete.first_name);
      }
      req.athlete = athlete;

      next();
    });
  }

  private guid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

}