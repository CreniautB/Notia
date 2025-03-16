import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { QuizTheme, QuizDifficulty } from '../shared/interfaces/QuizTypes';
import {
  CreateRejectedQuestionDto,
  UpdateRejectedQuestionDto,
  RejectionReason,
  RejectedQuestionResponseDto,
} from './dto/rejected-question.dto';
import { Question } from './schemas/question.schema';

// Interface pour les questions ajoutées
interface AddedQuestion {
  id: string;
  content: string;
  theme: QuizTheme;
  difficulty: QuizDifficulty;
}

// Interface pour les questions refusées
interface RejectedQuestion {
  content: string;
  theme: QuizTheme;
  difficulty: QuizDifficulty;
  reason: string;
}

// Interface pour le résultat du traitement par lots
interface BatchResult {
  added: AddedQuestion[];
  rejected: RejectedQuestion[];
  summary: {
    total: number;
    added: number;
    rejected: number;
  };
}

// Interface pour le résultat du traitement par lots simplifié
interface SimpleBatchResult {
  added: string[]; // Contenu des questions ajoutées
  rejected: {
    content: string;
    reason: string;
  }[]; // Contenu et raison des questions rejetées
  summary: {
    total: number;
    added: number;
    rejected: number;
  };
}

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau quiz' })
  @ApiResponse({ status: 201, description: 'Quiz créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }

  @Get('available')
  @ApiOperation({ summary: 'Récupérer les thèmes et difficultés disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Liste des thèmes et difficultés ayant au moins 10 questions',
  })
  getAvailableQuizzes() {
    return this.quizService.getAvailableQuizzes();
  }

  @Get('random')
  @ApiOperation({ summary: 'Générer un quiz aléatoire' })
  @ApiQuery({ name: 'theme', description: 'Thème du quiz', required: true })
  @ApiQuery({
    name: 'difficulty',
    description: 'Difficulté du quiz',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz aléatoire généré avec succès',
  })
  @ApiResponse({ status: 400, description: 'Thème ou difficulté invalide' })
  getRandomQuiz(
    @Query('theme') theme: string,
    @Query('difficulty') difficulty: string,
  ) {
    return this.quizService.getRandomQuiz(theme, difficulty);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les quiz' })
  @ApiResponse({
    status: 200,
    description: 'Liste des quiz récupérée avec succès',
  })
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un quiz par son ID' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiResponse({ status: 200, description: 'Quiz récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Get(':id/with-questions')
  @ApiOperation({ summary: 'Récupérer un quiz avec ses questions' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiResponse({
    status: 200,
    description: 'Quiz avec questions récupéré avec succès',
  })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  getQuizWithQuestions(@Param('id') id: string) {
    return this.quizService.getQuizWithQuestions(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un quiz' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiResponse({ status: 200, description: 'Quiz mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un quiz' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiResponse({ status: 204, description: 'Quiz supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }

  // Routes pour les questions
  @Post('question')
  @ApiOperation({ summary: 'Créer une nouvelle question' })
  @ApiResponse({ status: 201, description: 'Question créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.quizService.createQuestion(createQuestionDto);
  }

  @Get(':quizId/questions')
  @ApiOperation({ summary: "Récupérer toutes les questions d'un quiz" })
  @ApiParam({ name: 'quizId', description: 'ID du quiz' })
  @ApiResponse({ status: 200, description: 'Questions récupérées avec succès' })
  findAllQuestions(@Param('quizId') quizId: string) {
    return this.quizService.findAllQuestions(quizId);
  }

  @Get('question/:id')
  @ApiOperation({ summary: 'Récupérer une question par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la question' })
  @ApiResponse({ status: 200, description: 'Question récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Question non trouvée' })
  findOneQuestion(@Param('id') id: string) {
    return this.quizService.findOneQuestion(id);
  }

  @Patch('question/:id')
  @ApiOperation({ summary: 'Mettre à jour une question' })
  @ApiParam({ name: 'id', description: 'ID de la question' })
  @ApiResponse({ status: 200, description: 'Question mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Question non trouvée' })
  updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.quizService.updateQuestion(id, updateQuestionDto);
  }

  @Delete('question/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une question' })
  @ApiParam({ name: 'id', description: 'ID de la question' })
  @ApiResponse({ status: 204, description: 'Question supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Question non trouvée' })
  removeQuestion(@Param('id') id: string) {
    return this.quizService.removeQuestion(id);
  }

  // Fonction utilitaire pour normaliser les types de questions
  private normalizeQuestionType(type: string): string {
    if (!type) return type;

    // Convertir en minuscules et supprimer les espaces
    const normalizedType = type.toLowerCase().trim();

    // Mapper les différentes variations possibles vers les valeurs attendues
    if (
      normalizedType === 'multiple_choice' ||
      normalizedType === 'multiplechoice' ||
      normalizedType === 'multiple-choice' ||
      normalizedType === 'multiple choice' ||
      normalizedType === 'multiplechoice' ||
      normalizedType === 'mcq'
    ) {
      return 'multiple_choice';
    }

    if (
      normalizedType === 'text_input' ||
      normalizedType === 'textinput' ||
      normalizedType === 'text-input' ||
      normalizedType === 'text input' ||
      normalizedType === 'text'
    ) {
      return 'text_input';
    }

    // Si aucune correspondance n'est trouvée, retourner la valeur originale
    return type;
  }

  @Post('questions/batch')
  @ApiOperation({
    summary: 'Créer plusieurs questions en une seule requête',
    description:
      'Permet de créer plusieurs questions en une seule requête. Retourne un résumé des questions ajoutées et rejetées.',
  })
  @ApiResponse({ status: 201, description: 'Questions créées avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async createQuestionsBatch(
    @Body() createQuestionDtos: any[],
  ): Promise<SimpleBatchResult> {
    try {
      // Vérifier si createQuestionDtos est un tableau
      if (!Array.isArray(createQuestionDtos)) {
        throw new BadRequestException('Expected an array of questions');
      }

      // Normaliser les types de questions avant de les traiter
      const normalizedQuestions = createQuestionDtos.map((question) => ({
        ...question,
        type: this.normalizeQuestionType(question.type),
      }));

      console.log('Normalized questions:', normalizedQuestions);

      // Continuer avec le traitement normal
      return this.quizService.createQuestions(normalizedQuestions);
    } catch (error) {
      console.error('Error creating questions batch:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Get('rejected-questions')
  @ApiOperation({
    summary: 'Récupère les questions rejetées avec pagination et filtres',
    description:
      'Récupère une liste paginée des questions rejetées avec possibilité de filtrer par statut de révision et raison de rejet.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numéro de page (commence à 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre de résultats par page',
  })
  @ApiQuery({
    name: 'reviewed',
    required: false,
    type: Boolean,
    description: 'Filtre par statut de révision',
  })
  @ApiQuery({
    name: 'approved',
    required: false,
    type: Boolean,
    description: "Filtre par statut d'approbation",
  })
  @ApiQuery({
    name: 'rejectionReason',
    required: false,
    enum: RejectionReason,
    description: 'Filtre par raison de rejet',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des questions rejetées',
    type: RejectedQuestionResponseDto,
    isArray: true,
  })
  async findRejectedQuestions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('reviewed') reviewed?: string,
    @Query('approved') approved?: string,
    @Query('rejectionReason') rejectionReason?: RejectionReason,
  ) {
    return this.quizService.findRejectedQuestions(
      page,
      limit,
      reviewed !== undefined ? reviewed === 'true' : undefined,
      approved !== undefined ? approved === 'true' : undefined,
      rejectionReason,
    );
  }

  @Get('rejected-questions/:id')
  @ApiOperation({
    summary: 'Récupère une question rejetée par son ID',
    description: "Récupère les détails d'une question rejetée spécifique.",
  })
  @ApiParam({ name: 'id', description: 'ID de la question rejetée' })
  @ApiResponse({
    status: 200,
    description: 'La question rejetée a été trouvée',
    type: RejectedQuestionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Question rejetée non trouvée' })
  async findOneRejectedQuestion(@Param('id') id: string) {
    return this.quizService.findOneRejectedQuestion(id);
  }

  @Patch('rejected-questions/:id')
  @ApiOperation({
    summary: 'Met à jour une question rejetée',
    description:
      "Met à jour les informations d'une question rejetée, comme son statut de révision.",
  })
  @ApiParam({ name: 'id', description: 'ID de la question rejetée' })
  @ApiBody({ type: UpdateRejectedQuestionDto })
  @ApiResponse({
    status: 200,
    description: 'La question rejetée a été mise à jour',
    type: RejectedQuestionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Question rejetée non trouvée' })
  async updateRejectedQuestion(
    @Param('id') id: string,
    @Body() updateRejectedQuestionDto: UpdateRejectedQuestionDto,
  ) {
    return this.quizService.updateRejectedQuestion(
      id,
      updateRejectedQuestionDto,
    );
  }

  @Post('rejected-questions/:id/approve')
  @ApiOperation({
    summary: 'Approuve une question rejetée',
    description:
      'Approuve une question rejetée et la convertit en question normale.',
  })
  @ApiParam({ name: 'id', description: 'ID de la question rejetée' })
  @ApiQuery({
    name: 'reviewedBy',
    required: false,
    type: String,
    description: 'Identifiant de la personne effectuant la révision',
  })
  @ApiResponse({
    status: 201,
    description: 'La question a été approuvée et créée',
    type: Question,
  })
  @ApiResponse({ status: 404, description: 'Question rejetée non trouvée' })
  async approveRejectedQuestion(
    @Param('id') id: string,
    @Query('reviewedBy') reviewedBy?: string,
  ) {
    return this.quizService.approveRejectedQuestion(id, reviewedBy);
  }

  @Delete('rejected-questions/:id')
  @ApiOperation({
    summary: 'Supprime une question rejetée',
    description:
      'Supprime définitivement une question rejetée de la base de données.',
  })
  @ApiParam({ name: 'id', description: 'ID de la question rejetée' })
  @ApiResponse({
    status: 204,
    description: 'La question rejetée a été supprimée',
  })
  @ApiResponse({ status: 404, description: 'Question rejetée non trouvée' })
  @HttpCode(204)
  async removeRejectedQuestion(@Param('id') id: string) {
    return this.quizService.removeRejectedQuestion(id);
  }
}
