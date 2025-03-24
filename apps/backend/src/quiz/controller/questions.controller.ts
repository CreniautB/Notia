import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuestionsService } from '../service/questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Query('theme') theme?: string, @Query('difficulty') difficulty?: string) {
    return this.questionsService.findAll(theme, difficulty);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }
} 