import * as dotenv from 'dotenv';
import * as fs from 'fs';

export abstract class BaseConfigService {
  abstract get(key: string): string;
}

export class ConfigService extends BaseConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor(filePath: string) {
    super();
    this.envConfig = dotenv.parse(fs.readFileSync(filePath));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}