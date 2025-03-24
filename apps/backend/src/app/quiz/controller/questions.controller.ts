import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QuestionsService } from '../../../quiz/service/questions.service';
import { Question } from '../../../quiz/schemas/question.schema';
import { QuizTheme, QuizDifficulty } from '../../../shared/interfaces/QuizTypes';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { AdminGuard } from '../../../auth/guards/admin.guard';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async findAll(
    @Query('theme') theme?: string, 
    @Query('difficulty') difficulty?: string
  ): Promise<ApiResponse<Question[]>> {
    try {
      const questions = await this.questionsService.findAll(theme, difficulty);
      return {
        success: true,
        data: questions
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message || 'Une erreur est survenue lors de la récupération des questions',
          code: 'QUESTIONS_FETCH_ERROR'
        }
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Question>> {
    try {
      const question = await this.questionsService.findOne(id);
      return {
        success: true,
        data: question
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message || `Question avec ID ${id} non trouvée`,
          code: 'QUESTION_NOT_FOUND'
        }
      };
    }
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createData: Partial<Question>): Promise<ApiResponse<Question>> {
    try {
      const createdQuestion = await this.questionsService.create(createData);
      return {
        success: true,
        data: createdQuestion
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message || 'Erreur lors de la création de la question',
          code: 'QUESTION_CREATE_ERROR'
        }
      };
    }
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Question>
  ): Promise<ApiResponse<Question>> {
    try {
      const updatedQuestion = await this.questionsService.update(id, updateData);
      return {
        success: true,
        data: updatedQuestion
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message || `Erreur lors de la mise à jour de la question ${id}`,
          code: 'QUESTION_UPDATE_ERROR'
        }
      };
    }
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      await this.questionsService.remove(id);
      return {
        success: true,
        data: { deleted: true }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message || `Erreur lors de la suppression de la question ${id}`,
          code: 'QUESTION_DELETE_ERROR'
        }
      };
    }
  }
} 