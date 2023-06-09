import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/interface';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomLoggerService } from './infra/logger/logger.service';
import { LogicExceptionFilter } from './infra/filters';
import { ValidationPipe } from '@nestjs/common';

// TODO: завести мейлюку для рассылки(чуть позже), после этого протестить мейл(все должно быть чикапука)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  app.enableCors();

  const logger = app.get(CustomLoggerService);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new LogicExceptionFilter(logger));
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Board game stats API')
    .setVersion('0.0.1')
    // .addSecurity('bearer', {
    //   type: 'http',
    //   scheme: 'bearer',
    // })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(appConfig.listeningPort, '0.0.0.0');

  app.useLogger(logger);
  logger.log(
    `Listening on http://${appConfig.listeningIp}:${appConfig.listeningPort}`,
  );
}
bootstrap();
