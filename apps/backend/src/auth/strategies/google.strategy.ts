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
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/api/auth/google/callback',
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