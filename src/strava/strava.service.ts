import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class StravaService {

  private readonly base: string = 'https://www.strava.com/oauth/authorize';
  private readonly redirect_url: string = 'http://localhost:3000/auth/exchange';
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
    private readonly _httpClient: HttpService) {
  }

  get loginUrl(): string {
    return `${this.base}?client_id=${this.id}&redirect_uri=${this.redirect_url}&response_type=code`;
  }

}