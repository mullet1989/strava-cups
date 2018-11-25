import { Inject, Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';
import { StravaService } from '../strava/strava.service';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';
import { AthleteService } from '../athlete/athlete.service';

@Injectable()
export class StravaAuthMiddleware implements NestMiddleware {

  constructor(@Inject(STRAVA_SERVICE_TOKEN) private readonly _strava: StravaService,
              private readonly _athlete: AthleteService) {
  }

  /**
   * this is not doing anything right now
   * @param args
   */
  async resolve(...args: any[]): Promise<MiddlewareFunction> {
    return ((req, res, next) => {

      this._athlete.getAll()


    });
  }
}