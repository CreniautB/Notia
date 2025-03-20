import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuration CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ], // URLs du frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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

  await app.listen(3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
