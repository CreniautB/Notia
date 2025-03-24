import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import {
  RejectedQuestion,
  RejectedQuestionSchema,
} from './schemas/rejected-question.schema';
import { SharedModule } from '../shared/shared.module';
import { QuestionsController } from './controller/questions.controller';
import { QuestionsService } from './service/questions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: RejectedQuestion.name, schema: RejectedQuestionSchema },
    ]),
    SharedModule,
  ],
  controllers: [QuizController, QuestionsController],
  providers: [QuizService, QuestionsService],
  exports: [QuizService, QuestionsService],
})
export class QuizModule {}
