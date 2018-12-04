import { Athlete } from '../entity/athlete.entity';
import { Session } from '../entity/session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly _lookup: { [anon: string]: Athlete };

  constructor(@InjectRepository(Session)
              private readonly sessionRepository: Repository<Session>) {
    this._lookup = {}; // initialize empty
  }

  async newSessionAsync(anon: string, athlete: Athlete) {
    let session = new Session(anon, athlete);
    await this.sessionRepository.insert(session);
    this._lookup[anon] = athlete;
  }

  async tryGetAthleteAsync(anon: string): Promise<{ exists: boolean, athlete: Athlete; }> {
    if (this._lookup.hasOwnProperty(anon)) {
      return { exists: true, athlete: this._lookup[anon] };
    } else {
      let session = await this.sessionRepository.findOne({ anon: anon }, { relations: ['athlete'] });
      if (session) {
        return { exists: true, athlete: session.athlete };
      } else {
        return { exists: false, athlete: null };
      }
    }
  }
}