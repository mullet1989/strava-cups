import { Module } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { ConfigModule } from '../config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Athlete } from '../entity/user.entity';


@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Athlete]),
  ],
  providers: [
    AthleteService,
  ],
  exports: [AthleteService],
})
export class AthleteModule {
}