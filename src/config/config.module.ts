import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { join } from 'path';
import { ConfigProduction } from './config.production';

@Module({
  providers: [
    {
      provide: ConfigService,
      useFactory: () => {
        let env = process.env.NODE_ENV;
        if (env === "development") {
          return new ConfigService(join(__dirname, '../..', `${process.env.NODE_ENV}.env`))
        } else {
          return new ConfigProduction();
        }
      }
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {
}