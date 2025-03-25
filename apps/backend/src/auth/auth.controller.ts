import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserDocument } from './schemas/user.schema';



@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Cette méthode ne fait rien, le garde gère l'authentification
    // et redirige vers Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    // Après authentification, générer un JWT
    console.log("Callback Google OAuth reçu - authentifié:", req.isAuthenticated());
    console.log("User:", req.user);
    console.log("Environnement:", process.env.NODE_ENV || 'development');
    
    if (!req.user) {
      console.error("Aucun utilisateur trouvé dans la requête");
      return res.redirect(`${this.configService.get('FRONTEND_URL', 'http://localhost:4200')}/login?error=auth_failed`);
    }
    
    // Générer un JWT
    const token = this.authService.generateJwtToken(req.user as UserDocument);
    
    // Définir le token JWT comme cookie
    res.cookie('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production', // Secure en production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      path: '/',
    });
    
    // Récupérer l'URL frontend depuis les variables d'environnement
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    console.log("Redirection vers:", `${frontendUrl}/auth-callback?token=${encodeURIComponent(token)}`);
    
    // Rediriger vers une page intermédiaire qui stockera le token dans localStorage
    res.redirect(`${frontendUrl}/auth-callback?token=${encodeURIComponent(token)}`);
  }

  @Get('status')
  getAuthStatus(@Req() req: Request) {
    console.log("==== Requête de statut d'authentification reçue ====");
    
    // Récupérer le token JWT depuis les cookies ou l'en-tête Authorization
    let token = req.cookies?.auth_token;
    
    // Si pas de token dans le cookie, vérifier l'en-tête Authorization
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    console.log("Token trouvé:", token ? 'Oui' : 'Non');
    
    try {
      if (!token) {
        return { isAuthenticated: false, user: null };
      }
      
      // Vérifier et décoder le token JWT
      const decoded = this.authService.verifyJwtToken(token);
      console.log("Token décodé:", decoded);
      
      // Récupérer l'utilisateur complet depuis la base de données
      return { 
        isAuthenticated: true,
        user: {
          _id: decoded.sub,
          email: decoded.email,
          isAdmin: decoded.isAdmin
        }
      };
    } catch (error) {
      console.error("Erreur de vérification du token:", error);
      return { isAuthenticated: false, user: null };
    }
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    // Supprimer le cookie JWT
    res.clearCookie('auth_token');
    
    // Rediriger vers la page de login
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    res.redirect(`${frontendUrl}/login`);
  }
} 