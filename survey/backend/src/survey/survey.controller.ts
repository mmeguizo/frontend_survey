import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('surveys')
@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a survey' })
  @ApiResponse({ status: 201, description: 'Survey submitted successfully' })
  @ApiResponse({ status: 409, description: 'Survey already exists' })
  async submitSurvey(@Body() dto: CreateSurveyDto) {
    return this.surveyService.submitSurvey(dto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get survey by ID (Admin)' })
  async getSurveyById(@Param('id', ParseIntPipe) id: number) {
    return this.surveyService.getSurveyById(id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated surveys (Admin)' })
  async getSurveys(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(10)) limit: number,
    @Query('search') search?: string,
  ) {
    return this.surveyService.getSurveys(Number(page), Number(limit), search);
  }

  @Get('analytics/summary')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get survey analytics (Admin)' })
  async getAnalytics() {
    return this.surveyService.getAnalytics();
  }
}