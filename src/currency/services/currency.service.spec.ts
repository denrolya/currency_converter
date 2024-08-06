import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AVAILABLE_CURRENCIES } from '@src/currency/constants/curencies';
import { CurrencyPairExchangeRate } from '@src/currency/interfaces/currency-pair-exchange-rate.interface';
import { ExchangeService } from '@src/currency/interfaces/exchange.service.interface';
import { CurrencyService } from '@src/currency/services/currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let exchangeService: ExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: 'ExchangeService',
          useValue: {
            findPair: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
    exchangeService = module.get<ExchangeService>('ExchangeService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the same amount if source and target currencies are the same', async () => {
    const amount = 100;
    const currency = AVAILABLE_CURRENCIES.USD;

    const result = await service.convert(currency, currency, amount);

    expect(result).toBe(amount);
  });

  it('should convert currency when one of the currencies is UAH', async () => {
    const amount = 100;
    const source = AVAILABLE_CURRENCIES.USD;
    const target = AVAILABLE_CURRENCIES.UAH;
    const rate: CurrencyPairExchangeRate = {
      currencyCodeA: source.isoCode,
      currencyCodeB: target.isoCode,
      rateBuy: 27.5,
      rateSell: 28.0,
    };

    jest.spyOn(exchangeService, 'findPair').mockResolvedValue(rate);

    const result = await service.convert(source, target, amount);

    expect(result).toBe(amount * rate.rateSell);
  });

  it('should convert currency when both currencies are not UAH', async () => {
    const amount = 100;
    const source = AVAILABLE_CURRENCIES.USD;
    const target = AVAILABLE_CURRENCIES.EUR;
    const sourceRate: CurrencyPairExchangeRate = {
      currencyCodeA: source.isoCode,
      currencyCodeB: AVAILABLE_CURRENCIES.UAH.isoCode,
      rateBuy: 27.5,
      rateSell: 28.0,
    };
    const targetRate: CurrencyPairExchangeRate = {
      currencyCodeA: target.isoCode,
      currencyCodeB: AVAILABLE_CURRENCIES.UAH.isoCode,
      rateBuy: 30.0,
      rateSell: 31.0,
    };

    jest
      .spyOn(exchangeService, 'findPair')
      .mockResolvedValueOnce(sourceRate)
      .mockResolvedValueOnce(targetRate);

    const result = await service.convert(source, target, amount);

    expect(result).toBe((amount * sourceRate.rateSell) / targetRate.rateBuy);
  });

  it('should throw an error if the currency codes are invalid', async () => {
    const amount = 100;
    const source = { name: 'Some new currency', code: 'INVALID', isoCode: 999 };
    const target = AVAILABLE_CURRENCIES.UAH;

    jest.spyOn(exchangeService, 'findPair').mockResolvedValue(null);

    await expect(service.convert(source, target, amount)).rejects.toThrow(
      new HttpException('Invalid currency code', HttpStatus.BAD_REQUEST),
    );
  });

  it('should throw an error if the given currency pair is not supported', async () => {
    const amount = 100;
    const source = AVAILABLE_CURRENCIES.USD;
    const target = AVAILABLE_CURRENCIES.EUR;

    jest
      .spyOn(exchangeService, 'findPair')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(service.convert(source, target, amount)).rejects.toThrow(
      new HttpException(
        'Given currency pair is not supported',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });
});
