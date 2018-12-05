import { Controller, Get, HttpService, Inject, Query, Render, Req, Res } from '@nestjs/common';
import { StravaService } from '../strava/strava.service';
import { map } from 'rxjs/operators';
import { StravaBody } from '../strava/strava.models';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';
import { AthleteService } from '../athlete/athlete.service';
import { Athlete } from '../entity/athlete.entity';
import { AthleteAccessToken } from '../entity/athlete.accesstoken.entity';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {

  constructor(@Inject(STRAVA_SERVICE_TOKEN) private readonly stravaService: StravaService,
              private readonly athleteService: AthleteService,
              private readonly http: HttpService,
              private readonly _auth: AuthService) {
  }

  @Get("connect")
  connect(@Res() res): any {
    return res.redirect(this.stravaService.loginUrl);
  }

  @Get("exchange")
  async exchange(@Query() query, @Req() req, @Res() res) {
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

      let ath = await this.athleteService.getOne(athlete.id) || new Athlete();
      // athlete
      ath.athlete_id = athlete.id;
      ath.first_name = athlete.firstname;
      ath.last_name = athlete.lastname;

      // create if not exist
      if (!ath.access_tokens || !ath.access_tokens.length) {
        ath.access_tokens = [];
      }

      let access_token = new AthleteAccessToken();
      access_token.access_token = response.access_token;
      access_token.refresh_token = response.refresh_token;
      access_token.expires_datetime = new Date(response.expires_at);
      access_token.athlete = ath;
      ath.access_tokens.push(access_token);

      await this.athleteService.insert(ath);

      // make sessions
      let anon = req.anon;
      await this._auth.newSessionAsync(anon, ath, access_token.expires_datetime);

      res.render('success', {
        firstname: response.athlete.firstname,
        lastname: response.athlete.lastname,
      });

    } catch (e) {
      console.log(e);
      res.status(500);
    }

  }

}
