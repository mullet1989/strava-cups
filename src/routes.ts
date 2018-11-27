import { Routes } from 'nest-router';
import { StravaModule } from './strava/strava.module';
import { AthleteModule } from './athlete/athlete.module';
import { AuthModule } from './authentication/auth.module';


export const routes: Routes = [
  {
    path: '/strava',
    module: StravaModule,
    children: [
      {
        path: '/athlete',
        module: AthleteModule,
      },
    ],
  },
  {
    path: '/auth',
    module: AuthModule,
  },
];

