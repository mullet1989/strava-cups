import { Controller, Get, HttpService, Inject, Query, Render, Res } from '@nestjs/common';
import { StravaService } from '../strava/strava.service';
import { catchError, map } from 'rxjs/operators';
import { StravaBody } from '../strava/strava.models';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';
import { AthleteService } from '../athlete/athlete.service';
import { Athlete } from '../entity/user.entity';
import { ServerResponse } from 'http';

@Controller('auth')
export class AuthController {

  constructor(
    @Inject(STRAVA_SERVICE_TOKEN) private readonly stravaService: StravaService,
    private readonly athleteService: AthleteService,
    private readonly http: HttpService) {
  }

  @Get('connect')
  root(@Res() res): any {
    return res.redirect(this.stravaService.loginUrl);
  }

  @Get('exchange')
  @Render('success')
  async exchange(@Query() query) {
    let code = query.code;
    // todo : exchange token
    let redirect = this.stravaService.exchange_url;
    redirect += `?client_id=${this.stravaService.id}&client_secret=${this.stravaService.secret}&code=${code}&grant_type=${'authorization_code'}`;

    let response = await this.http.post<StravaBody>(redirect)
      .pipe(
        map(res => res.data),
      ).toPromise();

    // try insert to the database
    try {
      let athlete = response.athlete;
      let ath = new Athlete();
      ath.athlete_id = athlete.id;
      ath.first_name = athlete.firstname;
      ath.last_name = athlete.lastname;
      ath.access_token = response.access_token;
      await this.athleteService.insert(ath);
    } catch (e) {
      console.log(e);
    }


    return {
      firstname: response.athlete.firstname,
      lastname: response.athlete.lastname,
    };
  }

}
