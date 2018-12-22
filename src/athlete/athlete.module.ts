import { HttpModule, HttpService, Module } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Athlete } from '../entity/athlete.entity';
import { AthleteController } from './athlete.controller';
import { Activity } from '../entity/activity.entity';
import { AthleteAccessToken } from '../entity/athlete.accesstoken.entity';
import { HttpClient } from './http.client';
import { RatesModule } from '../rates/rates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Athlete,
        Activity,
        AthleteAccessToken,
      ]),
    RatesModule
  ],
  providers: [
    AthleteService,
    HttpClient,
  ],
  controllers: [AthleteController],
  exports: [AthleteService, HttpClient, RatesModule],
})
export class AthleteModule {
}