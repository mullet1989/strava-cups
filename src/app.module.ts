import { HttpModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './authentication/auth.module';
import { StravaModule } from './strava/strava.module';
import { StravaAuthMiddleware } from './authentication/auth.strava.middleware';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './typeorm.config.service';
import { RouterModule } from 'nest-router';
import { routes } from './routes';
import { AthleteModule } from './athlete/athlete.module';
import { TrackingMiddleware } from './authentication/tracking.middleware';

@Module({
  imports: [
    AthleteModule,
    StravaModule,
    AuthModule,
    ConfigModule,
    HttpModule,
    RouterModule.forRoutes(routes),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      imports: [ConfigModule],
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(TrackingMiddleware).forRoutes('*');
    consumer.apply(StravaAuthMiddleware).forRoutes('strava');
  }
}
