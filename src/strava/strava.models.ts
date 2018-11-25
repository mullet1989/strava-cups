export class StravaBody {
  token_type: string;
  access_token: string;
  athlete: Athlete;
  refresh_token: string;
  expires_at: number;
  state: string;
}

/**
 * this is private - interesting
 */
class Athlete {
  firstname: string;
  lastname: string;
}


