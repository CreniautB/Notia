import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        const uri =
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/notia';

        // Masquer les identifiants dans les logs
        const displayUri = uri.includes('@')
          ? uri.replace(/\/\/(.*):(.*)@/, '//***:***@')
          : uri;

        logger.log(`Tentative de connexion à MongoDB: ${displayUri}`);

        // Options de connexion depuis les variables d'environnement ou valeurs par défaut
        const retryAttempts = configService.get<number>(
          'MONGODB_RETRY_ATTEMPTS',
          3,
        );
        const retryDelay = configService.get<number>(
          'MONGODB_RETRY_DELAY',
          1000,
        );
        const connectTimeoutMS = configService.get<number>(
          'MONGODB_CONNECTION_TIMEOUT',
          5000,
        );

        return {
          uri,
          autoCreate: true,
          connectTimeoutMS,
          socketTimeoutMS: 45000,
          retryWrites: true,
          retryAttempts,
          retryDelay,
          serverSelectionTimeoutMS: connectTimeoutMS,
          // Fonction de callback pour les logs de connexion
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              logger.log('Connexion MongoDB établie avec succès');
            });
            connection.on('disconnected', () => {
              logger.warn('Déconnexion de MongoDB');
            });
            connection.on('error', (err) => {
              logger.error(`Erreur MongoDB: ${err.message}`);
            });
            return connection;
          },
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
