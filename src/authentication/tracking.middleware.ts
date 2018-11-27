import { Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';
import { AthleteService } from '../athlete/athlete.service';
import { Athlete } from '../entity/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class TrackingMiddleware implements NestMiddleware {

  constructor(private readonly _lookup: AuthService,
              private readonly _athlete: AthleteService) {
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
      res.anon = anon;

      // get matching athlete
      let athlete: Athlete;
      let athleteObj = this._lookup.tryGetAthlete(anon);
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