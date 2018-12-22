import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { Athlete } from '../entity/athlete.entity';
import * as _ from 'lodash';
import { Activity } from '../entity/activity.entity';


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
      // get top 10
      let activities = await this._athleteService.getDbActivitiesAsync(athlete, 10);
      return { activities: activities };
    } catch (e) {
      return e.message;
    }
  }

  @Get('compare')
  @Render('compare')
  async compare(@Req() req, @Res() res) {
    return { athlete: new Athlete() };
  }

  @Get('best')
  @Render('best')
  async best(@Req() req, @Res() res) {
    let athlete = req.athlete;
    let activities: Activity[];
    try {
      activities = await this._athleteService.getDbActivitiesAsync(athlete);
    } catch (e) {
      return e.message;
    }

    // kudos
    const kudos: Activity = _.maxBy(activities, 'kudos_count');
    // cups
    const cups: Activity = _.maxBy(activities, 'achievement_count');
    // comments
    const comments: Activity = _.maxBy(activities, 'comment_count');
    // athletes
    const others: Activity = _.maxBy(activities, 'athlete_count');
    // speed
    const speed: Activity = _.maxBy(activities, 'average_speed');

    return {
      athlete: athlete,
      kudos: kudos,
      cups: cups,
      comments: comments,
      others: others,
      speed: speed,
    };
  }
}