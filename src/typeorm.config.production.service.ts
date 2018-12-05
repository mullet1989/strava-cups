import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from './config/config.service';

@Injectable()
export class TypeormConfigProductionServiceService implements TypeOrmOptionsFactory {

  private readonly shouldRebuild: boolean = false;

  constructor(private readonly configService: ConfigService) {
    this.shouldRebuild = configService.get('SHOULD_REBUILD') === 'true';
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get('DATABASE_URL'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: this.shouldRebuild,
    };
  }
}