import {
  QuestionType,
  QuizTheme,
  QuizDifficulty,
} from '../../shared/interfaces/QuizTypes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuestionOptionDto } from './create-question.dto';

export enum RejectionReason {
  DUPLICATE = 'DUPLICATE',
  EXACT_DUPLICATE = 'EXACT_DUPLICATE',
  INAPPROPRIATE = 'INAPPROPRIATE',
  OTHER = 'OTHER',
}

export class CreateRejectedQuestionDto {
  @ApiPropertyOptional({
    description: 'ID du quiz auquel appartient la question (optionnel)',
    example: '60d21b4667d0d8992e610c85',
  })
  quizId?: string;

  @ApiProperty({
    description: 'Type de question',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @ApiProperty({
    description: 'Contenu de la question',
    example: 'Quelle est la capitale de la France ?',
  })
  content: string;

  @ApiPropertyOptional({
    description: 'URL du média associé à la question',
    example: 'https://example.com/image.jpg',
  })
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: 'Type de média',
    enum: ['image', 'audio', 'video'],
    example: 'image',
  })
  mediaType?: 'image' | 'audio' | 'video';

  @ApiProperty({
    description: 'Nombre de points attribués pour une réponse correcte',
    example: 1,
  })
  points: number;

  @ApiPropertyOptional({
    description: 'Temps limite pour répondre à la question (en secondes)',
    example: 30,
  })
  timeLimit?: number;

  @ApiPropertyOptional({
    description: 'Options pour les questions à choix multiples',
    type: [CreateQuestionOptionDto],
  })
  options?: CreateQuestionOptionDto[];

  @ApiPropertyOptional({
    description: 'Réponses acceptables pour les questions à réponse textuelle',
    example: ['Paris', 'paris'],
    type: [String],
  })
  acceptableAnswers?: string[];

  @ApiProperty({
    description: 'Thème de la question',
    enum: QuizTheme,
    example: QuizTheme.GEOGRAPHY,
  })
  theme: QuizTheme;

  @ApiProperty({
    description: 'Difficulté de la question',
    enum: QuizDifficulty,
    example: QuizDifficulty.MEDIUM,
  })
  difficulty: QuizDifficulty;

  @ApiProperty({
    description: 'Raison du rejet de la question',
    enum: RejectionReason,
    example: RejectionReason.DUPLICATE,
  })
  rejectionReason: RejectionReason;

  @ApiPropertyOptional({
    description: 'Détails supplémentaires sur le rejet',
    example: 'Question trop similaire à une question existante',
  })
  rejectionDetails?: string;

  @ApiPropertyOptional({
    description: 'ID de la question similaire (en cas de doublon)',
    example: '60d21b4667d0d8992e610c86',
  })
  similarQuestionId?: string;

  @ApiPropertyOptional({
    description: 'Score de similarité avec la question similaire',
    example: 0.85,
  })
  similarityScore?: number;
}

export class UpdateRejectedQuestionDto {
  @ApiPropertyOptional({
    description: 'Indique si la question a été revue',
    example: true,
  })
  reviewed?: boolean;

  @ApiPropertyOptional({
    description: 'Indique si la question a été approuvée après révision',
    example: true,
  })
  approved?: boolean;

  @ApiPropertyOptional({
    description: 'Date de révision',
    example: '2023-03-15T14:30:00Z',
  })
  reviewedAt?: Date;

  @ApiPropertyOptional({
    description: 'Identifiant de la personne ayant effectué la révision',
    example: 'admin@example.com',
  })
  reviewedBy?: string;
}

export class RejectedQuestionResponseDto extends CreateRejectedQuestionDto {
  @ApiProperty({
    description: 'ID unique de la question rejetée',
    example: '60d21b4667d0d8992e610c87',
  })
  _id: string;

  @ApiProperty({
    description: 'Indique si la question a été revue',
    example: false,
  })
  reviewed: boolean;

  @ApiProperty({
    description: 'Indique si la question a été approuvée après révision',
    example: false,
  })
  approved: boolean;

  @ApiPropertyOptional({
    description: 'Date de révision',
    example: '2023-03-15T14:30:00Z',
  })
  reviewedAt?: Date;

  @ApiPropertyOptional({
    description: 'Identifiant de la personne ayant effectué la révision',
    example: 'admin@example.com',
  })
  reviewedBy?: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2023-03-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2023-03-15T14:30:00Z',
  })
  updatedAt: Date;
}
