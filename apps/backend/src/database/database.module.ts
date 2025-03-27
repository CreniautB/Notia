import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          Logger.error(
            "Variable d'environnement MONGODB_URI non définie. Impossible de se connecter à MongoDB.",
            'DatabaseModule',
          );
          throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const retryAttempts = configService.get<number>('MONGODB_RETRY_ATTEMPTS', 5);
        const retryDelay = configService.get<number>('MONGODB_RETRY_DELAY', 1000);
        const connectionTimeout = configService.get<number>('MONGODB_CONNECTION_TIMEOUT', 10000);

        Logger.log(
          `Connexion à MongoDB: ${uri.replace(/\/\/.*@/, '//****:****@')}`,
          'DatabaseModule',
        );

        return {
          uri,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: connectionTimeout,
          socketTimeoutMS: connectionTimeout,
          connectTimeoutMS: connectionTimeout,
          retryAttempts,
          retryDelay,
          retryWrites: true,
          w: 'majority',
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
