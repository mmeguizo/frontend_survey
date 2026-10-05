import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const corsOriginsRaw = configService.get<string>('CORS_ORIGINS') || '*';
  const corsOrigins =
    corsOriginsRaw === '*'
      ? '*'
      : corsOriginsRaw.split(',').map((origin: string) => origin.trim());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use(helmet());
  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT') || 3004;
  await app.listen(port);
  console.log(`🚀 Application running on port ${port}`);
}
bootstrap();