import { Controller, Post, Body, UsePipes, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ConvertRequestDto } from '@src/currency/dto/convert-request.dto';
import { ConvertResponseDto } from '@src/currency/dto/convert-response.dto';
import { CurrencyService } from '@src/currency/services/currency.service';
import { CurrencyTransformer } from '@src/currency/transformers/currency.transformer';

@ApiTags('currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('convert')
  @HttpCode(200)
  @UsePipes(new CurrencyTransformer('source', 'target'))
  @ApiOperation({ summary: 'Convert currency' })
  @ApiResponse({
    status: 200,
    description: 'Conversion successful',
    type: ConvertResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async convert(@Body() convertCurrencyDto: ConvertRequestDto) {
    const { source, target, amount } = convertCurrencyDto;
    const convertedAmount = await this.currencyService.convert(
      source,
      target,
      amount,
    );
    return new ConvertResponseDto({
      amount,
      source: source.code,
      target: target.code,
      result: convertedAmount,
    });
  }
}
