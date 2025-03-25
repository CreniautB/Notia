import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    // Récupérer l'URL de callback depuis les variables d'environnement
    let callbackUrl = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://127.0.0.1:3001/api/auth/google/callback';
    
    // S'assurer que l'URL contient 127.0.0.1 et non localhost
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      if (callbackUrl.includes('localhost')) {
        callbackUrl = callbackUrl.replace('localhost', '127.0.0.1');
        console.log("URL de callback modifiée pour utiliser IPv4:", callbackUrl);
      }
    }
    
    // Adapter l'URL en fonction de l'environnement si nécessaire
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction && !callbackUrl.includes('217.154.16.57')) {
      // En prod, s'assurer que l'URL contient l'adresse du serveur
      callbackUrl = 'http://217.154.16.57/api/auth/google/callback';
      console.log("URL de callback modifiée pour la production:", callbackUrl);
    }
    
    // Log pour le débogage
    console.log(`Environnement: ${isProduction ? 'production' : 'development'}`);
    console.log("URL de callback Google configurée:", callbackUrl);
    
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log("====== Google Strategy validate ======");
    console.log("Profil Google reçu:", profile.id, profile.displayName);
    console.log("Email:", profile.emails[0].value);
    
    const { id, name, emails, photos } = profile;
    
    try {
      console.log("Validation ou création de l'utilisateur avec email:", emails[0].value);
      const user = await this.authService.validateOrCreateUser({
        googleId: id,
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos[0].value,
      });
      
      console.log("Utilisateur créé/validé avec succès:", user._id);
      console.log("isAdmin:", user.isAdmin);
      
      // Appel de done pour compléter l'authentification
      done(null, user);
    } catch (error) {
      console.error("Erreur lors de la validation/création de l'utilisateur:", error);
      done(error, null);
    }
  }
} 