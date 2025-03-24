import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { QuizTheme, QuizDifficulty } from '../../shared/interfaces/QuizTypes';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async findAll(theme?: string, difficulty?: string): Promise<Question[]> {
    let query = {};
    
    if (theme && theme !== 'TOUS') {
      query = { ...query, theme };
    }
    
    if (difficulty && difficulty !== 'TOUS') {
      query = { ...query, difficulty };
    }
    
    return this.questionModel.find(query).exec();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async create(createData: Partial<Question>): Promise<Question> {
    const createdQuestion = new this.questionModel(createData);
    return createdQuestion.save();
  }

  async update(id: string, updateData: Partial<Question>): Promise<Question> {
    const updatedQuestion = await this.questionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updatedQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    
    return updatedQuestion;
  }

  async remove(id: string): Promise<void> {
    const result = await this.questionModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
  }
} 