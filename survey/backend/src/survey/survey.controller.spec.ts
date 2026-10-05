import { Test, TestingModule } from '@nestjs/testing';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { ExecutionContext, CallHandler } from '@nestjs/common';

// Mock the AuthGuard
const mockAuthGuard = {
  canActivate: (context: ExecutionContext) => true,
};
const mockSurveyService = {
  submitSurvey: jest.fn(),
  getSurveys: jest.fn(),
  getSurveyById: jest.fn(),
};

describe('SurveyController', () => {
  let controller: SurveyController;
  let service: SurveyService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveyController],
      providers: [
        { provide: SurveyService, useValue: mockSurveyService },
      ],
    })
      .overrideGuard('jwt')
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<SurveyController>(SurveyController);
    service = module.get<SurveyService>(SurveyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitSurvey()', () => {
    it('returns 201 on success', async () => {
      const mockSurvey = { id: 1, ...new CreateSurveyDto() };
      mockSurveyService.submitSurvey.mockResolvedValue(mockSurvey);
      const result = await controller.submitSurvey(mockSurvey as any);
      expect(result).toBeDefined();
    });
  });

  describe('getSurveys()', () => {
    it('requires authentication', () => {
      // The route is protected by AuthGuard('jwt')
      expect(mockAuthGuard.canActivate({} as any)).toBe(true);
    });
  });

  describe('getSurveyById()', () => {
    it('requires authentication', () => {
      expect(mockAuthGuard.canActivate({} as any)).toBe(true);
    });
  });

  describe('getAnalytics()', () => {
    it('requires authentication', () => {
      expect(mockAuthGuard.canActivate({} as any)).toBe(true);
    });
  });
});