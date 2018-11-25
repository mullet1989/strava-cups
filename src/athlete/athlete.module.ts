import { Module } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { ConfigModule } from '../config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';


@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AthleteService,
  ],
  exports: [AthleteService],
})
export class AthleteModule {
}