import { Global, HttpModule, HttpService, Module } from '@nestjs/common';
import { StravaService } from './strava.service';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { STRAVA_SERVICE_TOKEN } from '../strava.constants';

const StravaProviders = [
  {
    provide: STRAVA_SERVICE_TOKEN,
    useFactory: (http: HttpService, config: ConfigService) => {

      let clientID = parseInt(config.get('CLIENT_ID'));
      let clientSecret = config.get('CLIENT_SECRET');

      return new StravaService(clientID, clientSecret, http);
    },
    inject: [HttpService, ConfigService],
  },
];

@Global()
@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [...StravaProviders],
  exports: [...StravaProviders],
})
export class StravaModule {
}