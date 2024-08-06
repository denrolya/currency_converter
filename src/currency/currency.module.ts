import { HttpModule } from '@nestjs/axios';
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

import { CurrencyController } from '@src/currency/controllers/currency.controller';
import { CurrencyService } from '@src/currency/services/currency.service';
import { MonobankService } from '@src/currency/services/monobank.service';

const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    store: redisStore,
    host: configService.get('redis.host'),
    port: configService.get('redis.port'),
    ttl: configService.get('cacheTtl'),
  }),
};

/**
 * TODO: Make possible to configure desired exchange in .env file
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    CacheModule.registerAsync(RedisOptions),
  ],
  controllers: [CurrencyController],
  providers: [
    CurrencyService,
    {
      provide: 'ExchangeService',
      useClass: MonobankService,
    },
  ],
})
export class CurrencyModule {}
