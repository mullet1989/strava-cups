import { Module } from '@nestjs/common';
import { RatesService } from './rates.service';

@Module({
  imports: [],
  providers: [RatesService],
  exports: [RatesService],
})
export class RatesModule {
}