import { Controller, Get, HttpService, Inject, Query, Render, Res } from '@nestjs/common';
import { StravaService } from '../strava/strava.service';
import { map } from 'rxjs/operators';
import { StravaBody } from '../strava/strava.models';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';

@Controller('auth')
export class AuthController {

  constructor(
    @Inject(STRAVA_SERVICE_TOKEN) private readonly stravaService: StravaService,
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

    return {
      firstname: response.athlete.firstname,
      lastname: response.athlete.lastname,
    };
  }

}
