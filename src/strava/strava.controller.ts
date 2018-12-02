import { Controller, Get, Inject, Param } from '@nestjs/common';
import { StravaService } from './strava.service';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';

@Controller()
export class StravaController {
  constructor(@Inject(STRAVA_SERVICE_TOKEN) private readonly _strava: StravaService) {
  }

  @Get()
  segments(@Param() params): any {
    let id = params.id;
    return id;
  }
}