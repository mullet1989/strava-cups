import { Controller, Get } from '@nestjs/common';


@Controller()
export class AthleteController {
  constructor() {
  }

  @Get()
  async athlete(): Promise<string> {
    return 'ues';
  }

  @Get("me")
  me(): string {
    return 'me';
  }
}