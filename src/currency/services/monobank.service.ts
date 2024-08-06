import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { lastValueFrom } from 'rxjs';

import { CACHE_KEYS } from '@src/currency/constants/cache-keys';
import { CurrencyPairExchangeRate } from '@src/currency/interfaces/currency-pair-exchange-rate.interface';
import { ExchangeService } from '@src/currency/interfaces/exchange.service.interface';

@Injectable()
export class MonobankService implements ExchangeService {
  private readonly apiUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.apiUrl = this.configService.get<string>('monobankApiUrl');
  }

  /**
   * Finds the exchange rate between two specified currencies.
   *
   * @param sourceISOCode - The ISO 4217 code of the first currency.
   * @param targetISOCode - The ISO 4217 code of the second currency.
   * @returns The exchange rate between the two specified currencies, or undefined if not found.
   */
  public async findPair(
    sourceISOCode: number,
    targetISOCode: number,
  ): Promise<CurrencyPairExchangeRate | undefined> {
    const rates = await this.fetchRates();

    if (rates.length === 0) {
      throw new HttpException(
        'No exchange rates available',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return rates.find(
      (rate) =>
        rate.currencyCodeA === sourceISOCode &&
        rate.currencyCodeB === targetISOCode,
    );
  }

  /**
   * Fetches the exchange rates from cache or the Monobank API if not cached already.
   * TODO: Possibly add validation of response data structure
   * @returns A promise that resolves to an array of CurrencyPairExchangeRate objects.
   * @throws HttpException if the exchange rates could not be fetched from the Monobank API.
   */
  public async fetchRates(): Promise<CurrencyPairExchangeRate[]> {
    const cachedRates = await this.cacheManager.get<CurrencyPairExchangeRate[]>(
      CACHE_KEYS.EXCHANGE_RATES,
    );

    if (!cachedRates) {
      try {
        const { data } = await lastValueFrom(this.httpService.get(this.apiUrl));
        await this.cacheManager.set(CACHE_KEYS.EXCHANGE_RATES, data);
        return data;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          throw new HttpException(
            'Monobank API URL not found (404)',
            HttpStatus.NOT_FOUND,
          );
        }
        throw new HttpException(
          'Failed to fetch exchange rates from Monobank API',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return cachedRates || [];
  }
}
