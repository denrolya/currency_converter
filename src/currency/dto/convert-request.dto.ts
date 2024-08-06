import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

import { Currency } from '@src/currency/interfaces/currency.interface';

/**
 * TODO: Ensure one validation error message is returned when currency is not provided.
 */
export class ConvertRequestDto {
  @ApiProperty({
    description: 'Currency code of the source currency in ISO 4217 format',
    required: true,
    example: 'EUR',
    type: String,
    maxLength: 3,
  })
  @IsNotEmpty({ message: 'Missing source currency code' })
  @IsString({ message: 'Invalid source currency format' })
  source: Currency;

  @ApiProperty({
    description: 'Currency code of the target currency in ISO 4217 format',
    required: true,
    example: 'UAH',
    type: String,
    maxLength: 3,
  })
  @IsNotEmpty({ message: 'Missing target currency code' })
  @IsString({ message: 'Invalid target currency format' })
  target: Currency;

  @ApiProperty({
    description: 'Amount of the source currency to convert',
    required: true,
    example: 100,
    type: Number,
    default: 1,
  })
  @IsNotEmpty({ message: 'Missing the amount to convert' })
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    { message: 'Invalid amount format' },
  )
  amount: number;
}
