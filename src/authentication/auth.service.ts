import { Athlete } from '../entity/user.entity';
import { AthleteService } from '../athlete/athlete.service';

export class AuthService {
  private readonly _lookup: { [anon: string]: Athlete };

  constructor(private readonly _athlete: AthleteService) {
    this._lookup = {}; // initialize empty
  }

  addAthlete(anon: string, athlete: Athlete) {
    this._lookup[anon] = athlete;
  }

  tryGetAthlete(anon: string): { exists: boolean, athlete: Athlete } {
    if (this._lookup.hasOwnProperty(anon)) {
      return { exists: true, athlete: this._lookup[anon] };
    } else {
      return { exists: false, athlete: null };
    }
  }
}