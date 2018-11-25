import { HttpModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './authentication/auth.module';
import { StravaModule } from './strava/strava.module';
import { StravaAuthMiddleware } from './authentication/auth.strava.middleware';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './typeorm.config.service';
import { AthleteModule } from './athlete/athlete.module';
import { TrackingMiddleware } from './authentication/tracking.middleware';

@Module({
  imports: [
    StravaModule,
    HttpModule,
    AuthModule,
    ConfigModule,
    AthleteModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(StravaAuthMiddleware).forRoutes('strava');
    consumer.apply(TrackingMiddleware).forRoutes('*');
  }
}
