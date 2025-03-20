import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/notia-quiz', {
      // Vous pouvez ajuster l'URL de connexion selon votre configuration
      autoCreate: true, // Crée automatiquement la base de données si elle n'existe pas
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
