import { Athlete } from '../entity/athlete.entity';
import { Session } from '../entity/session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AthleteAccessToken } from '../entity/athlete.accesstoken.entity';
import { AthleteService } from '../athlete/athlete.service';

@Injectable()
export class AuthService {

  constructor(@InjectRepository(Session)
              private readonly sessionRepository: Repository<Session>,
              @InjectRepository(AthleteAccessToken)
              private readonly accessTokenRepository: Repository<AthleteAccessToken>,
              private readonly athleteService: AthleteService) {
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
      const accessToken = await this.athleteService.refreshTokenAsync(session.athlete);
      await this.newSessionAsync(anon, accessToken.athlete, accessToken.expires_datetime);
      return accessToken.athlete;
    } else {
      return null;
    }
  }


}