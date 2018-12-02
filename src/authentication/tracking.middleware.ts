import { Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';
import { Athlete } from '../entity/athlete.entity';
import { AuthService } from './auth.service';

@Injectable()
export class TrackingMiddleware implements NestMiddleware {

  constructor(private readonly _lookup: AuthService) {
  }

  async resolve(): Promise<MiddlewareFunction> {
    return (async (req, res, next) => {

      // get anon
      let anon = req.cookies.a;
      if (!anon) {
        let someDate = new Date();
        let numberOfDaysToAdd = 365;
        someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
        anon = this.guid();
        res.cookie('a', anon, { expires: someDate, httpOnly: true });
      } else {
        // nothing to do!
      }

      // we *always* get an anon
      req.anon = anon;

      // get matching athlete
      let athlete: Athlete;
      let athleteObj = await this._lookup.tryGetAthleteAsync(anon);
      if (athleteObj.exists) {
        athlete = athleteObj.athlete;
        req.athlete = athlete;
      } else {
        // do something
      }


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