import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { Athlete } from '../entity/athlete.entity';
import * as _ from 'lodash';
import { Activity } from '../entity/activity.entity';
import { AthleteSummaryModel } from './athlete.summary.model';


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

  @Get('leaders')
  @Render('leaders')
  async leaders(@Req() req, @Res() res) {

    let athletes: Athlete[];
    try {
      athletes = await this._athleteService.getAll();
    } catch (e) {
      console.log(e);
      return { leaders: [] };
    }


    const leaders = [];

    // this is experimental
    const kudos = await this._athleteService.getTopMetricForAthletes('kudos_count');
    const cups = await this._athleteService.getTopMetricForAthletes('achievement_count');
    const comments = await this._athleteService.getTopMetricForAthletes('comment_count');
    const others = await this._athleteService.getTopMetricForAthletes('athlete_count');
    const speed = await this._athleteService.getTopMetricForAthletes('average_speed');
    const distance = await this._athleteService.getTopMetricForAthletes('distance');

    // num_runs
    const runs: AthleteSummaryModel[] = await this._athleteService.getAthleteTotalRuns();

    for (let athlete of athletes) {
      try {

        leaders.push({
          athlete_id: athlete.athlete_id,
          first_name: athlete.first_name,
          last_name: athlete.last_name,
          kudos: kudos[athlete.athlete_id],
          cups: cups[athlete.athlete_id],
          comments: comments[athlete.athlete_id],
          others: others[athlete.athlete_id],
          speed: speed[athlete.athlete_id],
          distance: distance[athlete.athlete_id],
          number: runs[athlete.athlete_id],
        });

        /*
        // todo : must make this more efficient as more people join
        const activities = await this._athleteService.getDbActivitiesAsync(athlete);

        // kudos
        const kudos: Activity = _.maxBy(activities, 'kudos_count') || new Activity();

        // cups
        const cups: Activity = _.maxBy(activities, 'achievement_count') || new Activity();
        // comments
        const comments: Activity = _.maxBy(activities, 'comment_count') || new Activity();
        // athletes
        const others: Activity = _.maxBy(activities, 'athlete_count') || new Activity();
        // speed
        const speed: Activity = _.maxBy(activities, 'average_speed') || new Activity();
        // distance
        const distance: Activity = _.maxBy(activities, 'distance') || new Activity();

        leaders.push({
          athlete_id: athlete.athlete_id,
          first_name: athlete.first_name,
          last_name: athlete.last_name,
          kudos: kudos,
          cups: cups,
          comments: comments,
          others: others,
          speed: speed,
          distance: distance,
          number: activities.length,
        });
        */

      } catch (e) {
        return e.message;
      }

    }

    // sort by kudos desc
    const orderedLeaders = _.orderBy(leaders, (e) => e.kudos.kudos_count, 'desc');

    return { leaders: orderedLeaders, overall: orderedLeaders[0] };
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