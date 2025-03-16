import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  QuestionType,
  QuizTheme,
  QuizDifficulty,
} from '../../shared/interfaces/QuizTypes';

export type QuestionDocument = Question & Document;

@Schema()
export class QuestionOption {
  @Prop({ required: true })
  content: string;

  @Prop()
  mediaUrl?: string;

  @Prop({ enum: ['image', 'audio', 'video'] })
  mediaType?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MediaAsset' })
  mediaAssetId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  isCorrect: boolean;
}

export const QuestionOptionSchema =
  SchemaFactory.createForClass(QuestionOption);

@Schema({ timestamps: true })
export class Question {
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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MediaAsset' })
  mediaAssetId?: MongooseSchema.Types.ObjectId;

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
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
