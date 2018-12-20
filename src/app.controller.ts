import { Get, Controller, Render, Req, Res } from '@nestjs/common';
import { AthleteService } from './athlete/athlete.service';
import { Athlete } from './entity/athlete.entity';


@Controller()
export class AppController {

  constructor(
    private readonly _athlete: AthleteService) {

  }

  @Get()
  @Render('index')
  index(@Req() req, @Res() res): any {

    if (req.athlete) {
      const user: Athlete = req.athlete;
      return {
        message: `Welcome ${user.first_name} ${user.last_name}`,
        athlete: user,
      };
    } else {
      return {
        message: 'Get started with Strava',
        athlete: null,
      };
    }


  }


  @Get()
  async home(): Promise<Athlete[]> {
    let athletes = await this._athlete.getAll();
    return athletes;
  }
}
