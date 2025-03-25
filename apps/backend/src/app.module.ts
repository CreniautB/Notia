import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as session from 'express-session';
import * as passport from 'passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { QuizModule } from './quiz/quiz.module';
import { ModuleRef } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { SharedModule } from './shared/shared.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryAttempts: configService.get<number>('MONGODB_RETRY_ATTEMPTS', 3),
        retryDelay: configService.get<number>('MONGODB_RETRY_DELAY', 1000),
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('MongoDB is connected');
          });
          connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
          });
          connection.on('disconnected', () => {
            console.log('MongoDB is disconnected');
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({
      session: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SESSION_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    AuthModule,
    AdminModule,
    QuizModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'SESSION_STORE',
      useFactory: (configService: ConfigService) => {
        const session = require('express-session');
        const MongoDBStore = require('connect-mongodb-session')(session);

        const store = new MongoDBStore({
          uri: configService.get<string>('MONGODB_URI'),
          collection: 'sessions',
        });

        store.on('error', (error) => {
          console.error('Session store error:', error);
        });

        return store;
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {
  constructor(
    private configService: ConfigService,
    private moduleRef: ModuleRef
  ) {}

  configure(consumer) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
    console.log("Configuration des sessions avec frontendUrl:", frontendUrl);
    
    consumer
      .apply(
        session({
          secret: this.configService.get<string>('SESSION_SECRET', 'notia-secret-key'),
          resave: true,                // Forcer la sauvegarde même si la session n'a pas changé
          saveUninitialized: true,     // Sauvegarder les sessions non initialisées
          name: 'notia.sid',           // Nom du cookie de session
          cookie: {
            maxAge: 86400000,          // 24 heures
            secure: false,             // Doit être false pour HTTP en développement
            httpOnly: false,           // Permettre l'accès depuis JavaScript
            path: '/',                 // Accessible depuis toutes les routes
          },
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
      
    // Afficher pour le débogage
    console.log("Passport et Express Session configurés");
    console.log("Session secret:", this.configService.get<string>('SESSION_SECRET', 'notia-secret-key').substring(0, 5) + '...');

    passport.serializeUser((user: any, done) => {
      console.log("====== Sérialisation de l'utilisateur ======");
      console.log("Utilisateur à sérialiser:", user._id);
      done(null, user._id);
    });

    passport.deserializeUser(async (id: string, done) => {
      console.log("====== Désérialisation de l'utilisateur ======");
      console.log("ID à désérialiser:", id);
      try {
        const userService = this.moduleRef.get('AuthService');
        const user = await userService.findUserById(id);
        console.log("Utilisateur désérialisé:", user?._id || "Non trouvé");
        done(null, user);
      } catch (error) {
        console.error("Erreur lors de la désérialisation:", error);
        done(error, null);
      }
    });
  }
}
