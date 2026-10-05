import { Test, TestingModule } from '@nestjs/testing';
import { SurveyService } from './survey.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateSurveyDto } from './dto/create-survey.dto';

const mockPrisma = {
  survey: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('SurveyService', () => {
  let service: SurveyService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(SurveyService);
    prisma = module.get(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitSurvey()', () => {
    it('creates a survey when ticketId is new', async () => {
      const dto: CreateSurveyDto = {
        ticketId: 'TKT-001',
        clientType: 'CITIZEN',
        date: '2024-01-01',
        sex: 'MALE',
        age: 30,
        regionOfResidence: 'Region VI',
        serviceTalisay: true,
        serviceExternal: false,
        cc1Awareness: 1,
        cc2Visibility: 1,
        cc3Helpfulness: 1,
        suggestions: 'Good service',
        emailAddress: 'test@example.com',
      };
      const mockSurvey = { id: 1, ...dto };
      mockPrisma.survey.findUnique.mockResolvedValue(null);
      mockPrisma.survey.create.mockResolvedValue(mockSurvey);

      const result = await service.submitSurvey(dto);
      expect(result).toBeDefined();
      expect(mockPrisma.survey.create).toHaveBeenCalled();
    });

    it('throws ConflictException when ticketId already exists', async () => {
      const dto: CreateSurveyDto = {
        ticketId: 'TKT-001',
        clientType: 'CITIZEN',
        date: '2024-01-01',
        sex: 'MALE',
        age: 30,
        regionOfResidence: 'Region VI',
      };
      mockPrisma.survey.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.submitSurvey(dto)).rejects.toThrow('Survey already exists');
    });
  });

  describe('getSurveys()', () => {
    it('returns paginated surveys', async () => {
      const mockSurveys = [
        { id: 1, ticketId: 'TKT-001', clientType: 'CITIZEN' },
        { id: 2, ticketId: 'TKT-002', clientType: 'BUSINESS' },
      ];
      mockPrisma.survey.findMany.mockResolvedValue(mockSurveys);
      mockPrisma.survey.count.mockResolvedValue(2);

      const result = await service.getSurveys(1, 10);
      expect(result.items).toBeDefined();
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('getSurveyById()', () => {
    it('returns a survey when found', async () => {
      const mockSurvey = { id: 1, ticketId: 'TKT-001', clientType: 'CITIZEN' };
      mockPrisma.survey.findUnique.mockResolvedValue(mockSurvey);

      const result = await service.getSurveyById(1);
      expect(result).toEqual(mockSurvey);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.survey.findUnique.mockResolvedValue(null);

      await expect(service.getSurveyById(999)).rejects.toThrow('not found');
    });
  });

  describe('getAnalytics()', () => {
    it('returns correct analytics structure', async () => {
      const mockSurveys = [
        { sqd0: 5, sqd1: 4, clientType: 'CITIZEN' },
        { sqd0: 3, sqd1: 4, clientType: 'BUSINESS' },
      ];
      mockPrisma.survey.findMany.mockResolvedValue(mockSurveys);
      mockPrisma.survey.count.mockResolvedValue(2);

      const result = await service.getAnalytics();
      expect(result.totalSurveys).toBe(2);
      expect(result.sqdAveragesPerQuestion).toBeDefined();
      expect(result.clientTypeDistribution).toBeDefined();
      expect(result.averageSqd).toBeDefined();
    });
  });
});