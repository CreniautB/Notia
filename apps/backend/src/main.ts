import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuration de CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-requested-with'],
    exposedHeaders: ['Set-Cookie']
  });

  app.use(cookieParser());

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Notia API')
    .setDescription('API Documentation for Notia')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Préfixe global pour toutes les routes API
  app.setGlobalPrefix('api');

  // Appliquer l'intercepteur de transformation globalement
  app.useGlobalInterceptors(new TransformInterceptor());

  // Validation des entrées globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans les DTOs
      transform: true, // Transforme les données en objets typés
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non autorisées
    }),
  );

  // Servir les fichiers statiques du frontend en production
  if (process.env.NODE_ENV === 'production') {
    const frontendPath = join(__dirname, '..', '..', 'frontend');
    app.useStaticAssets(frontendPath);
  }

  // Écouter sur l'interface IPv4 pour assurer la compatibilité avec le tunnel SSH
  await app.listen(3001, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
