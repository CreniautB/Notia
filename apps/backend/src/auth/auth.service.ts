import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as jwt from 'jsonwebtoken';

interface GoogleUser {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async validateUser(email: string): Promise<UserDocument> {
    let user = await this.userModel.findOne({ email });
    
    if (!user) {
      // Créer l'utilisateur s'il n'existe pas
      user = new this.userModel({
        email,
        createdAt: new Date(),
        isAdmin: false,
      });
      await user.save();
    }
    
    return user;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async getGoogleUser(req: any): Promise<UserDocument | null> {
    if (!req.user) {
      return null;
    }
    return req.user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async validateOrCreateUser(userData: GoogleUser): Promise<UserDocument> {
    // Recherche de l'utilisateur par son googleId
    let user = await this.userModel.findOne({ googleId: userData.googleId });

    // Si l'utilisateur n'existe pas, on le crée
    if (!user) {
      // Liste des administrateurs autorisés (emails)
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
      
      // Vérifier si l'email de l'utilisateur est dans la liste des administrateurs
      const isAdmin = adminEmails.includes(userData.email);
      
      // Créer le nouvel utilisateur
      user = await this.userModel.create({
        ...userData,
        isAdmin,
      });
    } else {
      // Mise à jour de la date de dernière connexion
      user.lastLogin = new Date();
      await user.save();
    }

    return user;
  }

  async isAdmin(id: string): Promise<boolean> {
    const user = await this.userModel.findById(id);
    return user?.isAdmin === true;
  }

  verifyJwtToken(token: string): JwtPayload {
    try {
      const secret = process.env.SESSION_SECRET || 'notia-secret-key';
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return decoded;
    } catch (error) {
      console.error('Erreur lors de la vérification du JWT:', error);
      throw new UnauthorizedException('Token invalide');
    }
  }

  generateJwtToken(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user._id instanceof Types.ObjectId ? user._id.toString() : String(user._id),
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const secret = process.env.SESSION_SECRET || 'notia-secret-key';
    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }
} 