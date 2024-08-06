import { ApiProperty } from '@nestjs/swagger';

export class ConvertResponseDto {
  @ApiProperty({
    description: 'Currency code of the source currency in ISO 4217 format',
    required: true,
    example: 'EUR',
    type: String,
    maxLength: 3,
  })
  source: string;

  @ApiProperty({
    description: 'Currency code of the target currency in ISO 4217 format',
    required: true,
    example: 'UAH',
    type: String,
    maxLength: 3,
  })
  target: string;

  @ApiProperty({
    description: 'Amount of the source currency to convert',
    required: true,
    example: 100,
    type: Number,
    default: 1,
  })
  amount: number;

  @ApiProperty({
    description: 'Amount of the target currency after conversion',
    required: true,
    example: 4500,
    type: Number,
    default: 1,
  })
  result: number;

  constructor(partial: Partial<ConvertResponseDto>) {
    Object.assign(this, partial);
  }
}
