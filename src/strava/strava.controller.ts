import { Controller, Get, Inject } from '@nestjs/common';
import { StravaService } from './strava.service';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';

@Controller('strava')
export class StravaController {
  constructor(@Inject(STRAVA_SERVICE_TOKEN) private readonly _strava: StravaService) {
    console.log('here is the strava controller');
  }

  @Get('segments')
  segments(): any {
    return 'heasodasid';
  }
}