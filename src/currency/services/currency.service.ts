import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';

import { AVAILABLE_CURRENCIES } from '@src/currency/constants/curencies';
import { Currency } from '@src/currency/interfaces/currency.interface';
import { ExchangeService } from '@src/currency/interfaces/exchange.service.interface';

@Injectable()
export class CurrencyService {
  constructor(
    @Inject('ExchangeService') private exchangeService: ExchangeService,
  ) {}

  /**
   * Converts the given amount from one currency to another.
   * Performs the conversion based on the following rules:
   * 1. If the source and target currencies are the same, the amount is returned as is.
   * 2. If one of the currencies is UAH, a single currency pair conversion rate is used.
   * 3. If both currencies are not UAH, two currency pairs conversion rates are used.
   *
   * @param source - The source currency code (ISO 4217 format).
   * @param target - The target currency code (ISO 4217 format).
   * @param amount - The amount to be converted.
   * @returns The converted amount.
   * @throws HttpException if the currency codes are invalid.
   */
  async convert(
    source: Currency,
    target: Currency,
    amount: number,
  ): Promise<number> {
    // If the source and target currencies are the same, return the amount as is
    if (source.code === target.code) {
      return amount;
    }

    const { code: UAH_CODE, isoCode: UAH_ISO_CODE } = AVAILABLE_CURRENCIES.UAH;
    let convertedAmount: number;

    // If one of the currencies is UAH, use single currency pair conversion rate
    if (source.code === UAH_CODE || target.code === UAH_CODE) {
      const rate = await this.exchangeService.findPair(
        source.code === UAH_CODE ? target.isoCode : source.isoCode,
        UAH_ISO_CODE,
      );

      if (!rate) {
        throw new HttpException(
          'Invalid currency code',
          HttpStatus.BAD_REQUEST,
        );
      }

      convertedAmount =
        source.code === UAH_CODE
          ? amount / rate.rateBuy
          : amount * rate.rateSell;
    } else {
      // If both currencies are not UAH, use two currency pairs conversion rates
      const sourceRate = await this.exchangeService.findPair(
        source.isoCode,
        UAH_ISO_CODE,
      );
      const targetRate = await this.exchangeService.findPair(
        target.isoCode,
        UAH_ISO_CODE,
      );

      if (!sourceRate || !targetRate) {
        throw new HttpException(
          'Given currency pair is not supported',
          HttpStatus.BAD_REQUEST,
        );
      }

      convertedAmount = (amount * sourceRate.rateSell) / targetRate.rateBuy;
    }

    return convertedAmount;
  }
}
