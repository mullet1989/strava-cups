import { HttpStatus, Inject, Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';
import { StravaService } from '../strava/strava.service';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';
import { AthleteService } from '../athlete/athlete.service';

@Injectable()
export class StravaAuthMiddleware implements NestMiddleware {

  private readonly isDebug: boolean;

  constructor(@Inject(STRAVA_SERVICE_TOKEN) private readonly _strava: StravaService) {
    this.isDebug = process.env.NODE_ENV === 'development';
  }

  /**
   * check whether the user is authenticated
   */
  async resolve(): Promise<MiddlewareFunction> {
    return ((req, res, next) => {

      if (!req.athlete) {
        // return to home page in production
        this.isDebug && false ? res.status(HttpStatus.UNAUTHORIZED).send() : res.redirect('/');
        return;
      }

      next();

    });
  }
}