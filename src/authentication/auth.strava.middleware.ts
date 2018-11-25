import { Inject, Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';
import { StravaService } from '../strava/strava.service';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';

@Injectable()
export class StravaAuthMiddleware implements NestMiddleware {

  constructor(@Inject(STRAVA_SERVICE_TOKEN) private readonly _strava: StravaService) {
  }

  /**
   * this is not doing anything right now
   * @param args
   */
  async resolve(...args: any[]): Promise<MiddlewareFunction> {
    return ((req, res, next) => {
      console.log('middleware was called');
      next();
    });
  }
}