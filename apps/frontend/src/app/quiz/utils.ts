import { QuizTheme, QuizDifficulty } from '@notia/shared/interfaces/QuizTypes';

export const THEME_LABELS: Record<QuizTheme, string> = {
  [QuizTheme.GEOGRAPHY]: 'Géographie',
  [QuizTheme.HISTORY]: 'Histoire',
  [QuizTheme.SCIENCE]: 'Sciences',
  [QuizTheme.LITERATURE]: 'Littérature',
  [QuizTheme.ARTS]: 'Arts',
  [QuizTheme.SPORTS]: 'Sports',
  [QuizTheme.GENERAL_KNOWLEDGE]: 'Culture générale',
};

export const DIFFICULTY_LABELS: Record<QuizDifficulty, string> = {
  [QuizDifficulty.EASY]: 'Facile',
  [QuizDifficulty.MEDIUM]: 'Moyen',
  [QuizDifficulty.HARD]: 'Difficile',
};

export const DIFFICULTY_COLORS: Record<QuizDifficulty, 'success' | 'warning' | 'error'> = {
  [QuizDifficulty.EASY]: 'success',
  [QuizDifficulty.MEDIUM]: 'warning',
  [QuizDifficulty.HARD]: 'error',
}; 