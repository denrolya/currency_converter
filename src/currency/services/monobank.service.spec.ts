import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse, AxiosRequestHeaders } from 'axios';
import { Cache } from 'cache-manager';
import { of } from 'rxjs';

import { CACHE_KEYS } from '@src/currency/constants/cache-keys';
import { CurrencyPairExchangeRate } from '@src/currency/interfaces/currency-pair-exchange-rate.interface';
import { MonobankService } from '@src/currency/services/monobank.service';

describe('MonobankService', () => {
  let service: MonobankService;
  let httpService: HttpService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonobankService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockReturnValue('https://api.monobank.ua/bank/currency'),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MonobankService>(MonobankService);
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch exchange rates from Monobank and store them in cache', async () => {
    const mockRates: CurrencyPairExchangeRate[] = [
      { currencyCodeA: 840, currencyCodeB: 978, rateBuy: 27.5, rateSell: 28.0 },
    ];
    jest.spyOn(httpService, 'get').mockReturnValue(
      of({
        data: mockRates,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {} as AxiosRequestHeaders,
        },
      } as AxiosResponse<CurrencyPairExchangeRate[]>),
    );

    const rates = await service.fetchRates();

    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.monobank.ua/bank/currency',
    );
    expect(cacheManager.set).toHaveBeenCalledWith(
      CACHE_KEYS.EXCHANGE_RATES,
      mockRates,
    );
    expect(rates).toEqual(mockRates);
  });

  it('should return cached exchange rates if available', async () => {
    const mockRates: CurrencyPairExchangeRate[] = [
      { currencyCodeA: 840, currencyCodeB: 978, rateBuy: 27.5, rateSell: 28.0 },
    ];
    jest.spyOn(cacheManager, 'get').mockResolvedValue(mockRates);

    const rates = await service.fetchRates();

    expect(rates).toEqual(mockRates);
    expect(httpService.get).not.toHaveBeenCalled();
  });

  it('should fetch exchange rates if not available in cache', async () => {
    const mockRates: CurrencyPairExchangeRate[] = [
      { currencyCodeA: 840, currencyCodeB: 978, rateBuy: 27.5, rateSell: 28.0 },
    ];
    jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);
    jest.spyOn(httpService, 'get').mockReturnValue(
      of({
        data: mockRates,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {} as AxiosRequestHeaders,
        },
      } as AxiosResponse<CurrencyPairExchangeRate[]>),
    );

    const rates = await service.fetchRates();

    expect(rates).toEqual(mockRates);
    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.monobank.ua/bank/currency',
    );
    expect(cacheManager.set).toHaveBeenCalledWith(
      CACHE_KEYS.EXCHANGE_RATES,
      mockRates,
    );
  });

  it('should find a specific currency pair', async () => {
    const mockRates: CurrencyPairExchangeRate[] = [
      { currencyCodeA: 840, currencyCodeB: 978, rateBuy: 27.5, rateSell: 28.0 },
    ];
    jest.spyOn(service, 'fetchRates').mockResolvedValue(mockRates);

    const rate = await service.findPair(840, 978);

    expect(rate).toEqual(mockRates[0]);
  });

  it('should throw an error if no exchange rates are available', async () => {
    jest.spyOn(service, 'fetchRates').mockResolvedValue([]);

    await expect(service.findPair(840, 978)).rejects.toThrow(
      new HttpException(
        'No exchange rates available',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );
  });

  it('should handle 404 error returned from Monobank API URL when fetching exchange rates', async () => {
    jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);

    // Simulate an error being thrown
    jest.spyOn(httpService, 'get').mockImplementation(() => {
      throw new HttpException(
        { message: 'Monobank: Wrong API URL', status: 404 },
        HttpStatus.NOT_FOUND,
      );
    });

    const response = service.fetchRates();

    await expect(response).rejects.toThrow(
      new HttpException(
        'Monobank API URL not found (404)',
        HttpStatus.NOT_FOUND,
      ),
    );
  });

  it('should handle any other error returned from Monobank API URL when fetching exchange rates', async () => {
    jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined);

    // Simulate an error being thrown
    jest.spyOn(httpService, 'get').mockImplementation(() => {
      throw new HttpException(
        { message: 'Monobank: Internal server error', status: 500 },
        HttpStatus.NOT_FOUND,
      );
    });

    const response = service.fetchRates();

    await expect(response).rejects.toThrow(
      new HttpException(
        'Failed to fetch exchange rates from Monobank API',
        HttpStatus.NOT_FOUND,
      ),
    );
  });
});
