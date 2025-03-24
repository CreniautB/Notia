import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AdminService {
  constructor() {}

  async getDashboardStats() {
    // À implémenter : statistiques pour le tableau de bord admin
    return {
      quizCount: 0,
      userCount: 0,
      questionCount: 0,
      lastCreated: new Date(),
    };
  }
} 