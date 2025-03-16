import { QuizTheme, QuizDifficulty, QuestionType } from '@notia/shared/interfaces/QuizTypes';

export interface QuestionOption {
  _id: string;
  questionId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  quizId: string;
  type: QuestionType;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  points: number;
  timeLimit?: number;
  options: QuestionOption[];
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  theme: QuizTheme;
  difficulty: QuizDifficulty;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}
