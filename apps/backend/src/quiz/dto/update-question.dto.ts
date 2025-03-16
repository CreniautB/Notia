import { QuestionType } from '../../shared/interfaces/QuizTypes';
import { CreateQuestionOptionDto } from './create-question.dto';

export class UpdateQuestionDto {
  type?: QuestionType;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  points?: number;
  timeLimit?: number;
  options?: CreateQuestionOptionDto[];
  acceptableAnswers?: string[];
}
