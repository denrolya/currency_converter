import {
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

import { AVAILABLE_CURRENCIES } from '@src/currency/constants/curencies';

@Injectable()
export class CurrencyTransformer implements PipeTransform {
  constructor(
    private sourceField: string,
    private targetField: string,
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' || !value) {
      return value;
    }

    const source = value[this.sourceField];
    const target = value[this.targetField];
    const sourceCurrency = AVAILABLE_CURRENCIES[source];
    const targetCurrency = AVAILABLE_CURRENCIES[target];

    if (!sourceCurrency) {
      throw new BadRequestException(`Invalid source currency code: ${source}`);
    }
    if (!targetCurrency) {
      throw new BadRequestException(`Invalid target currency code: ${target}`);
    }

    return {
      ...value,
      source: sourceCurrency,
      target: targetCurrency,
    };
  }
}
