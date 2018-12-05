export class StravaBody {
  token_type: string;
  access_token: string;
  refresh_token: string;
  athlete?: SummaryAthlete;
  state?: string;
  expires_at: number;
}

/**
 * this is private - interesting
 */
interface SummaryAthlete {
  id: number;
  username: string;
  resource_state: number;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  created_at: Date;
  updated_at: Date;
  badge_type_id: number;
  profile_medium: string;
  profile: string;
  friend: any;
  follower: any;
  follower_count: number;
  friend_count: number;
  mutual_friend_count: number;
  athlete_type: number;
  date_preference: string;
  measurement_preference: string;
  clubs: any;
  ftp: any;
  weight: number;
  bikes: any;
  shoes: any;
}


