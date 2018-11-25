import { Get, Controller, Render } from '@nestjs/common';
import { AthleteService } from './athlete/athlete.service';
import { User } from './entity/user.entity';


@Controller()
export class AppController {

  constructor(private readonly _athlete: AthleteService) {

  }

  @Get()
  @Render('index')
  auth(): any {
    return { message: 'Get started with Strava' };
  }


  @Get('home')
  async home(): Promise<User[]> {
    let athletes = await this._athlete.getAll();
    return athletes;
  }
}
