import {
  QuestionType,
  QuizTheme,
  QuizDifficulty,
} from '../../shared/interfaces/QuizTypes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionOptionDto {
  @ApiProperty({
    description: "Contenu de l'option",
    example: 'Paris',
  })
  content: string;

  @ApiPropertyOptional({
    description: "URL du média associé à l'option",
    example: 'https://example.com/image.jpg',
  })
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: 'Type de média',
    enum: ['image', 'audio', 'video'],
    example: 'image',
  })
  mediaType?: 'image' | 'audio' | 'video';

  @ApiPropertyOptional({
    description: "ID de la ressource média associée à l'option",
    example: '60d21b4667d0d8992e610c86',
  })
  mediaAssetId?: string;

  @ApiProperty({
    description: 'Indique si cette option est la réponse correcte',
    example: true,
  })
  isCorrect: boolean;
}

export class CreateQuestionDto {
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

  @ApiPropertyOptional({
    description: 'ID de la ressource média associée à la question',
    example: '60d21b4667d0d8992e610c86',
  })
  mediaAssetId?: string;

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
}
