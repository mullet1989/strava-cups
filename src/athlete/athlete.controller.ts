import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { Athlete } from '../entity/athlete.entity';


@Controller()
export class AthleteController {
  constructor(
    private readonly _athleteService: AthleteService) {
  }

  @Get('activities')
  @Render('activities')
  async activities(@Req() req, @Res() res) {
    let athlete = req.athlete;
    try {
      let activities = await this._athleteService.getDbActivitiesAsync(athlete, 10);
      return { activities: activities };
    } catch (e) {
      return e.message;
    }
  }

  @Get('compare')
  @Render('compare')
  async compare(@Req() req, @Res() res) {
    return { athlete1: new Athlete() };
  }
}