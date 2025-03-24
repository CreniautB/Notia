import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Vérifier si l'utilisateur est authentifié
    if (!request.user) {
      throw new UnauthorizedException('Vous devez être connecté pour accéder à cette ressource');
    }

    // Vérifier si l'utilisateur est un administrateur
    const isAdmin = await this.authService.isAdmin(request.user._id);
    
    if (!isAdmin) {
      throw new UnauthorizedException('Vous n\'avez pas les droits d\'administrateur nécessaires');
    }

    return true;
  }
} 