import { Global, HttpModule, HttpService, Module } from '@nestjs/common';
import { StravaService } from './strava.service';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';
import { StravaController } from './strava.controller';
import { HttpClient } from '../athlete/http.client';
import { AuthModule } from '../authentication/auth.module';

const StravaProviders = [
  {
    provide: STRAVA_SERVICE_TOKEN,
    useFactory: (http: HttpClient, config: ConfigService) => {

      let clientID = parseInt(config.get('CLIENT_ID'));
      let clientSecret = config.get('CLIENT_SECRET');

      return new StravaService(clientID, clientSecret, http, config);
    },
    inject: [HttpClient, ConfigService],
  },
];

@Global()
@Module({
  imports: [
    HttpModule,
    ConfigModule,
    AuthModule
  ],
  controllers: [StravaController],
  providers: [...StravaProviders],
  exports: [...StravaProviders],
})
export class StravaModule {
}