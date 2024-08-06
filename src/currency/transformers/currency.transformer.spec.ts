import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

import { AVAILABLE_CURRENCIES } from '@src/currency/constants/curencies';

import { CurrencyTransformer } from './currency.transformer';

describe('CurrencyTransformer', () => {
  let transformer: CurrencyTransformer;

  beforeEach(() => {
    transformer = new CurrencyTransformer('source', 'target');
  });

  it('should transform valid currency codes', () => {
    const value = { source: 'USD', target: 'UAH' };
    const metadata: ArgumentMetadata = { type: 'body' };

    const result = transformer.transform(value, metadata);

    expect(result).toEqual({
      ...value,
      source: AVAILABLE_CURRENCIES.USD,
      target: AVAILABLE_CURRENCIES.UAH,
    });
  });

  it('should throw an error for invalid source currency code', () => {
    const value = { source: 'INVALID', target: 'UAH' };
    const metadata: ArgumentMetadata = { type: 'body' };

    expect(() => transformer.transform(value, metadata)).toThrow(
      new BadRequestException('Invalid source currency code: INVALID'),
    );
  });

  it('should throw an error for invalid target currency code', () => {
    const value = { source: 'USD', target: 'INVALID' };
    const metadata: ArgumentMetadata = { type: 'body' };

    expect(() => transformer.transform(value, metadata)).toThrow(
      new BadRequestException('Invalid target currency code: INVALID'),
    );
  });

  it('should return the value unchanged if metadata type is not body', () => {
    const value = { source: 'USD', target: 'UAH' };
    const metadata: ArgumentMetadata = { type: 'query' };

    const result = transformer.transform(value, metadata);

    expect(result).toEqual(value);
  });
});
