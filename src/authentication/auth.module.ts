import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AthleteModule } from '../athlete/athlete.module';
import { AthleteService } from '../athlete/athlete.service';

@Module({
  imports: [AthleteModule],
  controllers: [AuthController],
  providers: [AthleteService],
})
export class AuthModule {
}
