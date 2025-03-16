import { QuizDifficulty, QuizTheme } from '../../shared/interfaces/QuizTypes';

export class UpdateQuizDto {
  title?: string;
  description?: string;
  theme?: QuizTheme;
  difficulty?: QuizDifficulty;
}
