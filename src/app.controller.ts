import { Get, Controller, Render, Req, Res } from '@nestjs/common';
import { AthleteService } from './athlete/athlete.service';
import { Athlete } from './entity/user.entity';


@Controller()
export class AppController {

  constructor(private readonly _athlete: AthleteService) {

  }

  @Get()
  @Render('index')
  index(@Req() req, @Res() res): any {

    return { message: 'Get started with Strava' };
  }


  @Get('home')
  async home(): Promise<Athlete[]> {
    let athletes = await this._athlete.getAll();
    return athletes;
  }
}
