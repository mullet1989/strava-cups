import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AthleteService } from '../athlete/athlete.service';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../entity/session.entity';
import { AthleteModule } from '../athlete/athlete.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
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
