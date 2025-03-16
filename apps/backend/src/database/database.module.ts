import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/notia-quiz', {
      // Vous pouvez ajuster l'URL de connexion selon votre configuration
      autoCreate: true, // Crée automatiquement la base de données si elle n'existe pas
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
