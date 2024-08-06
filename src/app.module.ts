import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from '@src/config/configuration';
import { CurrencyModule } from '@src/currency/currency.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    CurrencyModule,
  ],
})
export class AppModule {}
