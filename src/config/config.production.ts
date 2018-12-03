import { BaseConfigService } from './config.service';

export class ConfigProduction extends BaseConfigService {

  get(key: string): string {
    return process.env[key];
  }

}