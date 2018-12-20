import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { HttpClient } from '../athlete/http.client';

@Injectable()
export class StravaService {

  private readonly base: string = 'https://www.strava.com/oauth/authorize';
  private readonly redirect_url: string;
  public readonly exchange_url: string = 'https://www.strava.com/oauth/token';

  get id(): number {
    return this._id;
  }

  get secret(): string {
    return this._secret;
  }

  constructor(
    private readonly _id: number,
    private readonly _secret: string,
    private readonly _http: HttpClient,
    private readonly _config: ConfigService) {

    this.redirect_url = _config.get("REDIRECT_URL");
  }

  get loginUrl(): string {
    const scopes = `read_all,activity:read_all`;
    return `${this.base}?client_id=${this.id}&redirect_uri=${this.redirect_url}&response_type=code&scope=${scopes}`;
  }

}