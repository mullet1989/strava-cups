import { Module } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Athlete } from '../entity/athlete.entity';
import { AthleteController } from './athlete.controller';
import { Activity } from '../entity/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Athlete,
        Activity
      ]),
  ],
  providers: [
    AthleteService
  ],
  controllers: [AthleteController],
  exports: [AthleteService],
})
export class AthleteModule {
}