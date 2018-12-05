import { Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';
import { Athlete } from '../entity/athlete.entity';
import { AuthService } from './auth.service';

@Injectable()
export class TrackingMiddleware implements NestMiddleware {

  constructor(private readonly _lookup: AuthService) {
  }

  async resolve(): Promise<MiddlewareFunction> {
    return (async (req, res: any, next) => {

      // get anon
      let anon = req.cookies.a;
      if (!anon) {
        let someDate = this.getExpiration();
        anon = this.guid();
        res.cookie('a', anon, { expires: someDate, httpOnly: true });
      }

      req.anon = anon;

      // get matching athlete
      let athlete: Athlete;
      let dbAthlete = await this._lookup.getAthleteAsync(anon);
      if (dbAthlete) {
        athlete = dbAthlete;
        req.athlete = athlete;
      }

      next();
    });
  }

  private getExpiration(): Date {
    let someDate = new Date();
    let numberOfDaysToAdd = 365; // 1 year
    someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
    return someDate;
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