import { CacheModule } from '@nestjs/cache-manager';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AVAILABLE_CURRENCIES } from '@src/currency/constants/curencies';
import { CurrencyModule } from '@src/currency/currency.module';
import { CurrencyService } from '@src/currency/services/currency.service';

describe('CurrencyController (e2e)', () => {
  let app: INestApplication;
  let originalConsoleError: any;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), CacheModule.register(), CurrencyModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/currency/convert (POST) should convert currency', () => {
    return request(app.getHttpServer())
      .post('/currency/convert')
      .send({
        source: AVAILABLE_CURRENCIES.USD.code,
        target: AVAILABLE_CURRENCIES.UAH.code,
        amount: 100,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.result).toBeDefined();
      });
  });

  it('/currency/convert (POST) should handle invalid request', () => {
    return request(app.getHttpServer())
      .post('/currency/convert')
      .send({
        source: 'BAD',
        target: AVAILABLE_CURRENCIES.UAH.code,
        amount: 100,
      })
      .expect(400);
  });

  it('/currency/convert (POST) should handle internal server error', async () => {
    jest.spyOn(CurrencyService.prototype, 'convert').mockImplementation(() => {
      throw new Error('Internal server error');
    });

    await request(app.getHttpServer())
      .post('/currency/convert')
      .send({
        source: AVAILABLE_CURRENCIES.USD.code,
        target: AVAILABLE_CURRENCIES.UAH.code,
        amount: 100,
      })
      .expect(500);
  });
});
