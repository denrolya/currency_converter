import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AVAILABLE_CURRENCIES } from '@src/currency/constants/curencies';
import { ConvertRequestDto } from '@src/currency/dto/convert-request.dto';
import { ConvertResponseDto } from '@src/currency/dto/convert-response.dto';
import { CurrencyService } from '@src/currency/services/currency.service';

import { CurrencyController } from './currency.controller';

describe('CurrencyController', () => {
  let controller: CurrencyController;
  let service: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyController],
      providers: [
        {
          provide: CurrencyService,
          useValue: {
            convert: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CurrencyController>(CurrencyController);
    service = module.get<CurrencyService>(CurrencyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully convert currency', async () => {
    const convertCurrencyDto: ConvertRequestDto = {
      source: AVAILABLE_CURRENCIES.USD,
      target: AVAILABLE_CURRENCIES.UAH,
      amount: 100,
    };
    const convertedAmount = 2800;
    const expectedResponse = new ConvertResponseDto({
      amount: 100,
      source: 'USD',
      target: 'UAH',
      result: convertedAmount,
    });

    jest.spyOn(service, 'convert').mockResolvedValue(convertedAmount);

    const result = await controller.convert(convertCurrencyDto);

    expect(result).toEqual(expectedResponse);
    expect(service.convert).toHaveBeenCalledWith(
      convertCurrencyDto.source,
      convertCurrencyDto.target,
      convertCurrencyDto.amount,
    );
  });

  it('should handle invalid request', async () => {
    const convertCurrencyDto: ConvertRequestDto = {
      source: { name: 'Some new currency', code: 'INVALID', isoCode: 999 },
      target: AVAILABLE_CURRENCIES.UAH,
      amount: 100,
    };

    jest
      .spyOn(service, 'convert')
      .mockRejectedValue(
        new HttpException('Invalid currency code', HttpStatus.BAD_REQUEST),
      );

    await expect(controller.convert(convertCurrencyDto)).rejects.toThrow(
      new HttpException('Invalid currency code', HttpStatus.BAD_REQUEST),
    );
  });

  it('should handle internal server error', async () => {
    const convertCurrencyDto: ConvertRequestDto = {
      source: AVAILABLE_CURRENCIES.USD,
      target: AVAILABLE_CURRENCIES.UAH,
      amount: 100,
    };

    jest
      .spyOn(service, 'convert')
      .mockRejectedValue(
        new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

    await expect(controller.convert(convertCurrencyDto)).rejects.toThrow(
      new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );
  });
});
