export enum QuizTheme {
  GEOGRAPHY = 'geography',
  HISTORY = 'history',
  SCIENCE = 'science',
  LITERATURE = 'literature',
  ARTS = 'arts',
  SPORTS = 'sports',
  GENERAL_KNOWLEDGE = 'general_knowledge',
}

export enum QuizDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT_INPUT = 'text_input',
}

export interface QuestionOption {
  id: string;
  questionId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  isCorrect: boolean;
}

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  points: number;
  timeLimit?: number;
}

export interface MultipleChoiceQuestion extends Question {
  type: QuestionType.MULTIPLE_CHOICE;
  options: QuestionOption[];
}

export interface TextInputQuestion extends Question {
  type: QuestionType.TEXT_INPUT;
  acceptableAnswers: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  theme: QuizTheme;
  difficulty: QuizDifficulty;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}
