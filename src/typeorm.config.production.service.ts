import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from './config/config.service';

@Injectable()
export class TypeormConfigProductionServiceService implements TypeOrmOptionsFactory {

  constructor(private readonly configService: ConfigService) {
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get('DATABASE_URL'),
      synchronize: true, // will create on first run
    };
  }
}