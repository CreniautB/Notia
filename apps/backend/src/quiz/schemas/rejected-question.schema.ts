import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  QuestionType,
  QuizTheme,
  QuizDifficulty,
} from '../../shared/interfaces/QuizTypes';
import { Question } from './question.schema';

export type RejectedQuestionDocument = RejectedQuestion & Document;

@Schema()
export class QuestionOption {
  @Prop({ required: true })
  content: string;

  @Prop()
  mediaUrl?: string;

  @Prop({ enum: ['image', 'audio', 'video'] })
  mediaType?: string;

  @Prop({ required: true })
  isCorrect: boolean;
}

export const QuestionOptionSchema =
  SchemaFactory.createForClass(QuestionOption);

@Schema({ timestamps: true })
export class RejectedQuestion {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz' })
  quizId?: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(QuestionType),
    default: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @Prop({ required: true })
  content: string;

  @Prop()
  mediaUrl?: string;

  @Prop({ enum: ['image', 'audio', 'video'] })
  mediaType?: string;

  @Prop({ required: true, default: 1 })
  points: number;

  @Prop()
  timeLimit?: number;

  @Prop({ type: [QuestionOptionSchema], default: [] })
  options: QuestionOption[];

  @Prop({ type: [String], default: [] })
  acceptableAnswers: string[];

  @Prop({
    required: true,
    enum: Object.values(QuizTheme),
    default: QuizTheme.GENERAL_KNOWLEDGE,
  })
  theme: QuizTheme;

  @Prop({
    required: true,
    enum: Object.values(QuizDifficulty),
    default: QuizDifficulty.MEDIUM,
  })
  difficulty: QuizDifficulty;

  // Champs spécifiques aux questions rejetées
  @Prop({
    required: true,
    enum: ['DUPLICATE', 'EXACT_DUPLICATE', 'INAPPROPRIATE', 'OTHER'],
  })
  rejectionReason: string;

  @Prop()
  rejectionDetails?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question' })
  similarQuestionId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number })
  similarityScore?: number;

  @Prop({ default: false })
  reviewed: boolean;

  @Prop({ default: false })
  approved: boolean;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  reviewedBy?: string;
}

export const RejectedQuestionSchema =
  SchemaFactory.createForClass(RejectedQuestion);
