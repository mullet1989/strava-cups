import { Inject, Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';
import { StravaService } from '../strava/strava.service';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';
import { AthleteService } from '../athlete/athlete.service';

@Injectable()
export class StravaAuthMiddleware implements NestMiddleware {

  constructor(@Inject(STRAVA_SERVICE_TOKEN) private readonly _strava: StravaService) {
  }

  /**
   * this is not doing anything right now
   * @param args
   */
  async resolve(): Promise<MiddlewareFunction> {
    return ((req, res, next) => {

      if (req.athlete) {
        // we are good
        console.log("has athlete")
        next();
      } else {
        res.status(401).send();
        return;
      }

    });
  }
}