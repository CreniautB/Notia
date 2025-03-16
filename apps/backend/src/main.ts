import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: 'http://localhost:4200', // URL du frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Notia Quiz API')
    .setDescription('API pour la gestion des quiz de Notia')
    .setVersion('1.0')
    .addTag('quiz')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Préfixe global pour toutes les routes API
  app.setGlobalPrefix('api');

  await app.listen(3001);
  console.log(`Application is running on: http://localhost:3001/api`);
  console.log(
    `Documentation Swagger disponible sur: http://localhost:3001/api/docs`,
  );
}
bootstrap().catch((err) => console.error('Failed to start server:', err));
