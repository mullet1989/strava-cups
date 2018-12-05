import { Athlete } from '../entity/athlete.entity';
import { Session } from '../entity/session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService, Injectable } from '@nestjs/common';
import { AthleteAccessToken } from '../entity/athlete.accesstoken.entity';
import { ConfigService } from '../config/config.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { StravaBody } from '../strava/strava.models';

@Injectable()
export class AuthService {

  constructor(@InjectRepository(Session)
              private readonly sessionRepository: Repository<Session>,
              @InjectRepository(AthleteAccessToken)
              private readonly accessTokenRepository: Repository<AthleteAccessToken>,
              private readonly _configService: ConfigService,
              private readonly _httpService: HttpService) {
  }

  async newSessionAsync(anon: string, athlete: Athlete, expires: Date) {
    const session = new Session();
    session.athlete = athlete;
    session.anon = anon;
    session.expires_datetime = expires;

    await this.sessionRepository.insert(session);
  }

  async getAthleteAsync(anon: string): Promise<Athlete> {
    let session = await this.sessionRepository.findOne({ anon: anon });

    const now: Date = new Date();
    if (session && session.expires_datetime < now) {
      return session.athlete;
      // session exists but is expired -> make new session
    } else if (session && session.expires_datetime >= now) {
      const accessToken = await this.refreshTokenAsync(session.athlete);
      await this.newSessionAsync(anon, accessToken.athlete, accessToken.expires_datetime);
      return accessToken.athlete;
    } else {
      return null;
    }
  }

  async refreshTokenAsync(athlete: Athlete): Promise<AthleteAccessToken> {
    const url: string = `https://www.strava.com/oauth/token`;
    const grant_type: string = 'refresh_token';
    const refresh_token: string = this._configService.get('REFRESH_TOKEN');
    const client_id: string = this._configService.get('CLIENT_ID');
    const client_secret: string = this._configService.get('CLIENT_SECRET');

    const newAccessToken = await this._httpService.post<StravaBody>(url,
      {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': grant_type,
        'refresh_token': refresh_token,
      })
      .pipe(
        map(response => response.data),
        catchError(err => {
          console.log(err); // log error and return empty response
          return of(new StravaBody());
        }),
      )
      .toPromise();

    let accessToken = new AthleteAccessToken();
    accessToken.access_token = newAccessToken.access_token;
    accessToken.refresh_token = newAccessToken.refresh_token;
    accessToken.athlete = athlete;
    accessToken.expires_datetime = new Date(newAccessToken.expires_at);
    await this.accessTokenRepository.insert(accessToken);

    return accessToken;
  }
}