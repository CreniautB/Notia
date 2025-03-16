import { QuizDifficulty, QuizTheme } from '../../shared/interfaces/QuizTypes';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({
    description: 'Titre du quiz',
    example: 'Capitales du monde',
  })
  title: string;

  @ApiProperty({
    description: 'Description du quiz',
    example:
      'Testez vos connaissances sur les capitales des pays du monde entier.',
  })
  description: string;

  @ApiProperty({
    description: 'Thème du quiz',
    enum: QuizTheme,
    example: QuizTheme.GEOGRAPHY,
  })
  theme: QuizTheme;

  @ApiProperty({
    description: 'Difficulté du quiz',
    enum: QuizDifficulty,
    example: QuizDifficulty.MEDIUM,
  })
  difficulty: QuizDifficulty;
}
