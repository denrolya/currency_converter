/**
 * Represents the exchange rate object returned by the Monobank API
 */
export interface CurrencyPairExchangeRate {
  readonly currencyCodeA: number;
  readonly currencyCodeB: number;
  readonly rateBuy: number;
  readonly rateSell: number;
}
