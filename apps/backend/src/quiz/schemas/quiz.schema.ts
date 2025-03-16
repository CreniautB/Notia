import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { QuizDifficulty, QuizTheme } from '../../shared/interfaces/QuizTypes';

export type QuizDocument = Quiz & Document;

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

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

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
