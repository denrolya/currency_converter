import { CurrencyPairExchangeRate } from '@src/currency/interfaces/currency-pair-exchange-rate.interface';

export interface ExchangeService {
  fetchRates(): Promise<CurrencyPairExchangeRate[]>;
  findPair(
    sourceISOCode: number,
    targetISOCode: number,
  ): Promise<CurrencyPairExchangeRate | undefined>;
}
