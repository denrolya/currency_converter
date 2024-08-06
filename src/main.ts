import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from '@src/app.module';

const DEFAULT_APP_PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appPort = process.env.PORT || DEFAULT_APP_PORT;

  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Currency Converter')
    .setDescription('Currency converter API using Monobank exchange rates')
    .setVersion('1.0')
    .addTag('monobank')
    .addServer(`http://localhost:${appPort}`)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(appPort);
}

bootstrap();
