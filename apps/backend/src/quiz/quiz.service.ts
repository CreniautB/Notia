import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import {
  RejectedQuestion,
  RejectedQuestionDocument,
} from './schemas/rejected-question.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import {
  CreateRejectedQuestionDto,
  UpdateRejectedQuestionDto,
  RejectionReason,
} from './dto/rejected-question.dto';
import { NlpService } from '../shared/services/nlp.service';

// Interface pour le résultat du traitement par lots simplifié
interface SimpleBatchResult {
  added: string[]; // Contenu des questions ajoutées
  rejected: {
    content: string;
    reason: string;
    similarQuestionId?: string; // ID de la question similaire (en cas de doublon)
    similarityScore?: number; // Score de similarité
  }[]; // Contenu et raison des questions rejetées
  summary: {
    total: number;
    added: number;
    rejected: number;
  };
}

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(RejectedQuestion.name)
    private rejectedQuestionModel: Model<RejectedQuestionDocument>,
    private nlpService: NlpService,
  ) {}

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const createdQuiz = new this.quizModel(createQuizDto);
    return createdQuiz.save();
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizModel.find().exec();
  }

  async findOne(id: string): Promise<Quiz> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const updatedQuiz = await this.quizModel
      .findByIdAndUpdate(id, updateQuizDto, { new: true })
      .exec();
    if (!updatedQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return updatedQuiz;
  }

  async remove(id: string): Promise<void> {
    const result = await this.quizModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    // Supprimer également toutes les questions associées
    await this.questionModel.deleteMany({ quizId: id }).exec();
  }

  async getQuizWithQuestions(id: string): Promise<any> {
    const quiz = await this.findOne(id);
    const questions = await this.questionModel.find({ quizId: id }).exec();
    return { ...quiz['toJSON'](), questions };
  }

  /**
   * Vérifie si une question est exactement identique à une question déjà rejetée
   * @param content Le contenu de la question à vérifier
   * @returns La question rejetée si une correspondance exacte est trouvée, null sinon
   */
  async checkForExactRejectedQuestion(
    content: string,
  ): Promise<RejectedQuestion | null> {
    // Normaliser le contenu (supprimer les espaces supplémentaires, mettre en minuscules)
    const normalizedContent = content.trim().toLowerCase();

    // Rechercher une question rejetée avec exactement le même contenu
    const rejectedQuestion = await this.rejectedQuestionModel
      .findOne({
        content: new RegExp(`^${normalizedContent}$`, 'i'), // Recherche insensible à la casse
      })
      .exec();

    return rejectedQuestion;
  }

  /**
   * Vérifie si une question est un doublon potentiel
   * @param content Le contenu de la question à vérifier
   * @returns La question existante si un doublon est trouvé, null sinon
   */
  async checkForDuplicateQuestion(content: string): Promise<Question | null> {
    // D'abord, vérifier si la question est exactement identique à une question déjà rejetée
    const exactRejectedQuestion =
      await this.checkForExactRejectedQuestion(content);

    if (exactRejectedQuestion) {
      // Si une correspondance exacte est trouvée dans les questions rejetées,
      // on rejette cette question mais on retourne null car ce n'est pas un doublon d'une question existante
      // La gestion de ce cas sera faite dans createQuestion et createQuestions
      console.log(
        'Question exactement identique à une question déjà rejetée:',
        exactRejectedQuestion.content,
      );
      return null;
    }

    // Récupérer toutes les questions existantes
    const existingQuestions = await this.questionModel.find().exec();

    // Vérifier chaque question existante
    for (const question of existingQuestions) {
      const isDuplicate = await this.nlpService.arePotentialDuplicates(
        content,
        question.content,
      );

      if (isDuplicate) {
        return question;
      }
    }

    return null;
  }

  /**
   * Crée une nouvelle question après vérification des doublons
   */
  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    // Vérifier si la question est exactement identique à une question déjà rejetée
    const exactRejectedQuestion = await this.checkForExactRejectedQuestion(
      createQuestionDto.content,
    );

    if (exactRejectedQuestion) {
      console.log(
        `Question exactement identique à une question déjà rejetée: "${exactRejectedQuestion.content}". Pas de nouvelle entrée créée.`,
      );

      throw new BadRequestException(
        `Question exactement identique à une question déjà rejetée: "${exactRejectedQuestion.content}"`,
      );
    }

    // Vérifier si la question est un doublon
    const duplicateQuestion = await this.checkForDuplicateQuestion(
      createQuestionDto.content,
    );

    if (duplicateQuestion) {
      // Calculer le score de similarité
      const similarityScore = await this.nlpService.calculateSimilarity(
        createQuestionDto.content,
        duplicateQuestion.content,
      );

      // Ne sauvegarder dans la table des questions rejetées que si le score est entre 0.7 et 0.9
      if (similarityScore < 0.9) {
        // Créer une entrée dans la table des questions rejetées
        const rejectedQuestionDto: CreateRejectedQuestionDto = {
          ...createQuestionDto,
          rejectionReason: RejectionReason.DUPLICATE,
          rejectionDetails: `Question similaire à: "${duplicateQuestion.content}"`,
          similarQuestionId: duplicateQuestion['_id'].toString(),
          similarityScore,
        };

        await this.createRejectedQuestion(rejectedQuestionDto);
        console.log(
          `Question avec similarité ${similarityScore} sauvegardée dans la table des questions rejetées.`,
        );
      } else {
        console.log(
          `Question avec similarité ${similarityScore} (≥ 0.9) non sauvegardée dans la table des questions rejetées.`,
        );
      }

      throw new BadRequestException(
        `Question similaire déjà existante: "${duplicateQuestion.content}"`,
      );
    }

    // Le quizId est maintenant optionnel
    // Si un quizId est fourni, vérifier que le quiz existe
    if (createQuestionDto.quizId) {
      try {
        await this.findOne(createQuestionDto.quizId);
      } catch (error) {
        // Si le quiz n'existe pas, on crée une question sans quiz associé
        delete createQuestionDto.quizId;
      }
    }

    const createdQuestion = new this.questionModel({
      ...createQuestionDto,
      // Convertir quizId en ObjectId seulement s'il existe
      ...(createQuestionDto.quizId && {
        quizId: new Types.ObjectId(createQuestionDto.quizId),
      }),
    });
    return createdQuestion.save();
  }

  async findAllQuestions(quizId: string): Promise<Question[]> {
    return this.questionModel.find({ quizId }).exec();
  }

  async findOneQuestion(id: string): Promise<Question> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async updateQuestion(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const updatedQuestion = await this.questionModel
      .findByIdAndUpdate(id, updateQuestionDto, { new: true })
      .exec();
    if (!updatedQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return updatedQuestion;
  }

  async removeQuestion(id: string): Promise<void> {
    const result = await this.questionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
  }

  async getRandomQuiz(theme: string, difficulty: string): Promise<any> {
    // Vérifier que le thème et la difficulté sont valides
    const isValidTheme = Object.values(this.getThemeEnum()).includes(theme);
    const isValidDifficulty = Object.values(this.getDifficultyEnum()).includes(
      difficulty,
    );

    if (!isValidTheme || !isValidDifficulty) {
      throw new NotFoundException('Thème ou difficulté invalide');
    }

    // Récupérer des questions aléatoires correspondant au thème et à la difficulté
    const questions = await this.questionModel
      .aggregate([
        { $match: { theme, difficulty } },
        { $sample: { size: 10 } }, // Prendre 10 questions aléatoires
      ])
      .exec();

    if (!questions || questions.length === 0) {
      throw new NotFoundException(
        `Aucune question disponible pour le thème ${this.getThemeLabel(theme)} et la difficulté ${this.getDifficultyLabel(difficulty)}. Veuillez ajouter des questions via l'API.`,
      );
    }

    // Générer un quiz avec les questions trouvées
    const quiz = {
      id: `random-${Date.now()}`,
      title: `Quiz ${this.getThemeLabel(theme)} - ${this.getDifficultyLabel(difficulty)}`,
      description: `Un quiz sur le thème ${this.getThemeLabel(theme)} de niveau ${this.getDifficultyLabel(difficulty)}.`,
      theme,
      difficulty,
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return quiz;
  }

  private async generateRandomQuestions(
    theme: string,
    difficulty: string,
    count: number,
  ): Promise<any[]> {
    // Récupérer des questions réelles depuis la base de données
    const questions = await this.questionModel
      .find()
      .where('theme')
      .equals(theme)
      .where('difficulty')
      .equals(difficulty)
      .limit(count)
      .exec();

    // Si aucune question n'est trouvée, renvoyer une erreur
    if (!questions || questions.length === 0) {
      throw new NotFoundException(
        `Aucune question disponible pour le thème ${this.getThemeLabel(theme)} et la difficulté ${this.getDifficultyLabel(difficulty)}. Veuillez ajouter des questions via l'API.`,
      );
    }

    return questions;
  }

  private getThemeEnum() {
    return {
      GEOGRAPHY: 'geography',
      HISTORY: 'history',
      SCIENCE: 'science',
      LITERATURE: 'literature',
      ARTS: 'arts',
      SPORTS: 'sports',
      GENERAL_KNOWLEDGE: 'general_knowledge',
    };
  }

  private getDifficultyEnum() {
    return {
      EASY: 'easy',
      MEDIUM: 'medium',
      HARD: 'hard',
    };
  }

  private getThemeLabel(theme: string): string {
    const labels = {
      geography: 'Géographie',
      history: 'Histoire',
      science: 'Sciences',
      literature: 'Littérature',
      arts: 'Arts',
      sports: 'Sports',
      general_knowledge: 'Culture générale',
    };
    return labels[theme] || theme;
  }

  private getDifficultyLabel(difficulty: string): string {
    const labels = {
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile',
    };
    return labels[difficulty] || difficulty;
  }

  private getPointsForDifficulty(difficulty: string): number {
    const points = {
      easy: 1,
      medium: 2,
      hard: 3,
    };
    return points[difficulty] || 1;
  }

  async getAvailableQuizzes(): Promise<any[]> {
    // Utiliser l'agrégation MongoDB pour compter les questions par thème et difficulté
    const availableQuizzes = await this.questionModel
      .aggregate([
        // Grouper par thème et difficulté
        {
          $group: {
            _id: { theme: '$theme', difficulty: '$difficulty' },
            count: { $sum: 1 },
          },
        },
        // Filtrer pour ne garder que les groupes avec au moins 10 questions
        {
          $match: {
            count: { $gte: 10 },
          },
        },
        // Formater le résultat
        {
          $project: {
            _id: 0,
            theme: '$_id.theme',
            difficulty: '$_id.difficulty',
            count: 1,
            themeLabel: { $literal: '' }, // Sera rempli après
            difficultyLabel: { $literal: '' }, // Sera rempli après
          },
        },
        // Trier par thème puis par difficulté
        {
          $sort: {
            theme: 1,
            difficulty: 1,
          },
        },
      ])
      .exec();

    // Ajouter les labels pour les thèmes et difficultés
    return availableQuizzes.map((quiz) => ({
      ...quiz,
      themeLabel: this.getThemeLabel(quiz.theme),
      difficultyLabel: this.getDifficultyLabel(quiz.difficulty),
    }));
  }

  async createQuestions(createQuestionDtos: any[]): Promise<SimpleBatchResult> {
    const results: SimpleBatchResult = {
      added: [],
      rejected: [],
      summary: {
        total: createQuestionDtos.length,
        added: 0,
        rejected: 0,
      },
    };

    // Traiter chaque question individuellement
    for (const dto of createQuestionDtos) {
      try {
        // Vérifier si la question est exactement identique à une question déjà rejetée
        const exactRejectedQuestion = await this.checkForExactRejectedQuestion(
          dto.content,
        );

        if (exactRejectedQuestion) {
          console.log(
            `Question exactement identique à une question déjà rejetée: "${exactRejectedQuestion.content}". Pas de nouvelle entrée créée.`,
          );

          // Ajouter à la liste des questions rejetées pour le rapport
          results.rejected.push({
            content: dto.content,
            reason: `Question exactement identique à une question déjà rejetée: "${exactRejectedQuestion.content}"`,
            similarQuestionId: exactRejectedQuestion['_id'].toString(),
            similarityScore: 1.0,
          });
          results.summary.rejected++;
          continue; // Passer à la question suivante
        }

        // Vérifier si la question est un doublon
        const duplicateQuestion = await this.checkForDuplicateQuestion(
          dto.content,
        );

        if (duplicateQuestion) {
          // Calculer le score de similarité
          const similarityScore = await this.nlpService.calculateSimilarity(
            dto.content,
            duplicateQuestion.content,
          );

          // Ajouter à la liste des questions rejetées pour le rapport
          results.rejected.push({
            content: dto.content,
            reason: `Question similaire à: "${duplicateQuestion.content}"`,
            similarQuestionId: duplicateQuestion['_id'].toString(),
            similarityScore,
          });
          results.summary.rejected++;

          // Ne sauvegarder dans la table des questions rejetées que si le score est entre 0.7 et 0.9
          if (similarityScore < 0.9) {
            // Créer une entrée dans la table des questions rejetées
            const rejectedQuestionDto: CreateRejectedQuestionDto = {
              ...dto,
              rejectionReason: RejectionReason.DUPLICATE,
              rejectionDetails: `Question similaire à: "${duplicateQuestion.content}"`,
              similarQuestionId: duplicateQuestion['_id'].toString(),
              similarityScore,
            };

            await this.createRejectedQuestion(rejectedQuestionDto);
            console.log(
              `Question avec similarité ${similarityScore} sauvegardée dans la table des questions rejetées.`,
            );
          } else {
            console.log(
              `Question avec similarité ${similarityScore} (≥ 0.9) non sauvegardée dans la table des questions rejetées.`,
            );
          }
        } else {
          // Tenter de créer la question
          const question = await this.createQuestion(dto);
          // Si réussi, ajouter le contenu à la liste des questions ajoutées
          results.added.push(question.content);
          results.summary.added++;
        }
      } catch (error) {
        // Si l'erreur est liée à un doublon, extraire l'ID de la question similaire
        let similarQuestionId: string | undefined = undefined;
        let similarityScore: number | undefined = undefined;
        let rejectionReason = RejectionReason.OTHER;
        let rejectionDetails = error.message || 'Erreur inconnue';

        // Vérifier si l'erreur contient des informations sur un doublon
        if (
          error instanceof BadRequestException &&
          error.message.includes('Question similaire')
        ) {
          rejectionReason = RejectionReason.DUPLICATE;

          // Essayer d'extraire l'ID de la question similaire si disponible
          const match = error.message.match(/ID: ([a-f0-9]+)/i);
          if (match && match[1]) {
            similarQuestionId = match[1];
          }
        }

        // Vérifier si l'erreur concerne une question exactement identique à une question déjà rejetée
        if (
          error instanceof BadRequestException &&
          error.message.includes(
            'Question exactement identique à une question déjà rejetée',
          )
        ) {
          // Ne pas créer une nouvelle entrée dans la table des questions rejetées
          console.log(
            'Erreur concernant une question exactement identique, pas de nouvelle entrée créée.',
          );

          // Ajouter à la liste des questions rejetées pour le rapport
          results.rejected.push({
            content: dto.content,
            reason: rejectionDetails,
            similarQuestionId,
            similarityScore,
          });
          results.summary.rejected++;
          continue; // Passer à la question suivante
        }

        // Pour les autres erreurs, vérifier si nous devons sauvegarder dans la table des questions rejetées
        // Si un score de similarité est disponible et qu'il est >= 0.9, ne pas sauvegarder
        if (similarityScore !== undefined && similarityScore >= 0.9) {
          console.log(
            `Question avec similarité ${similarityScore} (≥ 0.9) non sauvegardée dans la table des questions rejetées.`,
          );

          // Ajouter à la liste des questions rejetées pour le rapport
          results.rejected.push({
            content: dto.content,
            reason: rejectionDetails,
            similarQuestionId,
            similarityScore,
          });
          results.summary.rejected++;
          continue; // Passer à la question suivante
        }

        // Créer une entrée dans la table des questions rejetées
        const rejectedQuestionDto: CreateRejectedQuestionDto = {
          ...dto,
          rejectionReason,
          rejectionDetails,
          similarQuestionId,
          similarityScore,
        };

        await this.createRejectedQuestion(rejectedQuestionDto);

        // Ajouter à la liste des questions rejetées
        results.rejected.push({
          content: dto.content,
          reason: rejectionDetails,
          similarQuestionId,
          similarityScore,
        });
        results.summary.rejected++;
      }
    }

    return results;
  }

  /**
   * Crée une nouvelle question rejetée
   */
  async createRejectedQuestion(
    createRejectedQuestionDto: CreateRejectedQuestionDto,
  ): Promise<RejectedQuestion> {
    // Vérifier si une question avec le même contenu existe déjà dans la table des questions rejetées
    const existingRejectedQuestion = await this.rejectedQuestionModel
      .findOne({
        content: createRejectedQuestionDto.content,
      })
      .exec();

    if (existingRejectedQuestion) {
      console.log(
        `Question déjà rejetée avec le même contenu: "${createRejectedQuestionDto.content}". Pas de nouvelle entrée créée.`,
      );
      return existingRejectedQuestion;
    }

    // Si aucune question avec le même contenu n'existe, créer une nouvelle entrée
    const createdRejectedQuestion = new this.rejectedQuestionModel(
      createRejectedQuestionDto,
    );
    return createdRejectedQuestion.save();
  }

  /**
   * Récupère toutes les questions rejetées
   */
  async findAllRejectedQuestions(): Promise<RejectedQuestion[]> {
    return this.rejectedQuestionModel.find().exec();
  }

  /**
   * Récupère les questions rejetées avec pagination et filtres
   */
  async findRejectedQuestions(
    page: number = 1,
    limit: number = 10,
    reviewed?: boolean,
    approved?: boolean,
    rejectionReason?: RejectionReason,
  ): Promise<{
    data: RejectedQuestion[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = {};

    if (reviewed !== undefined) {
      query.reviewed = reviewed;
    }

    if (approved !== undefined) {
      query.approved = approved;
    }

    if (rejectionReason) {
      query.rejectionReason = rejectionReason;
    }

    const total = await this.rejectedQuestionModel.countDocuments(query);
    const data = await this.rejectedQuestionModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Récupère une question rejetée par son ID
   */
  async findOneRejectedQuestion(id: string): Promise<RejectedQuestion> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Rejected question with ID ${id} not found`);
    }

    const rejectedQuestion = await this.rejectedQuestionModel
      .findById(id)
      .exec();
    if (!rejectedQuestion) {
      throw new NotFoundException(`Rejected question with ID ${id} not found`);
    }

    return rejectedQuestion;
  }

  /**
   * Met à jour une question rejetée
   */
  async updateRejectedQuestion(
    id: string,
    updateRejectedQuestionDto: UpdateRejectedQuestionDto,
  ): Promise<RejectedQuestion> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Rejected question with ID ${id} not found`);
    }

    // Si la question est marquée comme revue, ajouter la date de révision
    if (
      updateRejectedQuestionDto.reviewed &&
      !updateRejectedQuestionDto.reviewedAt
    ) {
      updateRejectedQuestionDto.reviewedAt = new Date();
    }

    const updatedRejectedQuestion = await this.rejectedQuestionModel
      .findByIdAndUpdate(id, updateRejectedQuestionDto, { new: true })
      .exec();

    if (!updatedRejectedQuestion) {
      throw new NotFoundException(`Rejected question with ID ${id} not found`);
    }

    return updatedRejectedQuestion;
  }

  /**
   * Approuve une question rejetée et la convertit en question normale
   */
  async approveRejectedQuestion(
    id: string,
    reviewedBy?: string,
  ): Promise<Question> {
    const rejectedQuestion = await this.findOneRejectedQuestion(id);

    // Créer une nouvelle question à partir de la question rejetée
    const createQuestionDto: CreateQuestionDto = {
      quizId: rejectedQuestion.quizId?.toString(),
      type: rejectedQuestion.type,
      content: rejectedQuestion.content,
      mediaUrl: rejectedQuestion.mediaUrl,
      mediaType: rejectedQuestion.mediaType as 'image' | 'audio' | 'video',
      points: rejectedQuestion.points,
      timeLimit: rejectedQuestion.timeLimit,
      options: rejectedQuestion.options.map((option) => ({
        content: option.content,
        mediaUrl: option.mediaUrl,
        mediaType: option.mediaType as 'image' | 'audio' | 'video' | undefined,
        isCorrect: option.isCorrect,
      })),
      acceptableAnswers: rejectedQuestion.acceptableAnswers,
      theme: rejectedQuestion.theme,
      difficulty: rejectedQuestion.difficulty,
    };

    // Créer la nouvelle question
    const newQuestion = await this.createQuestion(createQuestionDto);

    // Mettre à jour la question rejetée pour indiquer qu'elle a été approuvée
    await this.updateRejectedQuestion(id, {
      reviewed: true,
      approved: true,
      reviewedAt: new Date(),
      reviewedBy,
    });

    return newQuestion;
  }

  /**
   * Supprime une question rejetée
   */
  async removeRejectedQuestion(id: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Rejected question with ID ${id} not found`);
    }

    const result = await this.rejectedQuestionModel
      .deleteOne({ _id: id })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Rejected question with ID ${id} not found`);
    }
  }
}
