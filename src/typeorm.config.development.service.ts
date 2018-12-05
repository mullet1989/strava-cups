import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from './config/config.service';

@Injectable()
export class TypeormConfigDevelopmentService implements TypeOrmOptionsFactory {

  constructor(private readonly configService: ConfigService) {
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('HOST'),
      port: parseInt(this.configService.get('PORT')),
      username: this.configService.get('USERNAME'),
      password: this.configService.get('PASSWORD'),
      database: this.configService.get('DATABASE'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }
}