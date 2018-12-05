import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AthleteService } from '../athlete/athlete.service';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AthleteModule } from '../athlete/athlete.module';
import { Session } from '../entity/session.entity';
import { AthleteAccessToken } from '../entity/athlete.accesstoken.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, AthleteAccessToken]),
    AthleteModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AthleteService,
  ],
  exports: [AuthService],
})
export class AuthModule {
}
