import { Controller, Get, Req } from '@nestjs/common';
import { AthleteService } from './athlete.service';


@Controller()
export class AthleteController {
  constructor(
    private readonly _athleteService: AthleteService) {
  }

  @Get('activities')
  async activities(@Req() req) {
    let athlete = req.athlete;
    try {
      let activities = await this._athleteService.getActivitiesAsync(athlete);
      return activities;
    } catch (e) {
      return e.message;
    }
  }
}