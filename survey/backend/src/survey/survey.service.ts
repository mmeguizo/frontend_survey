import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';

@Injectable()
export class SurveyService {
  constructor(private readonly prisma: PrismaService) {}

  async submitSurvey(dto: CreateSurveyDto) {
    const ticketId = dto.ticketId ?? `SURVEY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const existing = dto.ticketId
      ? await this.prisma.survey.findUnique({ where: { ticketId: dto.ticketId } })
      : null;
    if (existing) {
      throw new ConflictException('Survey already exists for this ticketId');
    }

    const survey = await this.prisma.survey.create({
      data: {
        ticketId,
        clientType: dto.clientType,
        date: dto.date,
        sex: dto.sex,
        age: dto.age,
        regionOfResidence: dto.regionOfResidence,
        serviceTalisay: dto.serviceTalisay ?? false,
        serviceExternal: dto.serviceExternal ?? false,
        cc1Awareness: dto.cc1Awareness,
        cc2Visibility: dto.cc2Visibility,
        cc3Helpfulness: dto.cc3Helpfulness,
        sqd0: dto.sqd0,
        sqd1: dto.sqd1,
        sqd2: dto.sqd2,
        sqd3: dto.sqd3,
        sqd4: dto.sqd4,
        sqd5: dto.sqd5,
        sqd6: dto.sqd6,
        sqd7: dto.sqd7,
        sqd8: dto.sqd8,
        suggestions: dto.suggestions,
        emailAddress: dto.emailAddress,
      },
    });

    return survey;
  }

  async getSurveys(page: number, limit: number, search?: string) {
    const where = search
      ? {
          OR: [
            { ticketId: { contains: search, mode: 'insensitive' as const } },
            { emailAddress: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.survey.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.survey.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSurveyById(id: number) {
    const survey = await this.prisma.survey.findUnique({ where: { id } });
    if (!survey) {
      throw new NotFoundException(`Survey with id ${id} not found`);
    }
    return survey;
  }

  async getAnalytics() {
    const totalSurveys = await this.prisma.survey.count();

    const allSurveys = await this.prisma.survey.findMany({
      select: {
        sqd0: true,
        sqd1: true,
        sqd2: true,
        sqd3: true,
        sqd4: true,
        sqd5: true,
        sqd6: true,
        sqd7: true,
        sqd8: true,
        clientType: true,
      },
    });

    const sqdFields = ['sqd0', 'sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'] as const;

    const sqdAveragesPerQuestion: Record<string, number> = {};
    let totalSqdSum = 0;
    let totalSqdCount = 0;

    for (const field of sqdFields) {
      const values = allSurveys
        .map(s => s[field])
        .filter((v): v is number => v !== null && v !== undefined);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = values.length > 0 ? sum / values.length : 0;
      sqdAveragesPerQuestion[field] = Number(avg.toFixed(2));
      totalSqdSum += sum;
      totalSqdCount += values.length;
    }

    const averageSqd = totalSqdCount > 0 ? Number((totalSqdSum / totalSqdCount).toFixed(2)) : 0;

    const clientTypeCounts = allSurveys.reduce((acc, s) => {
      acc[s.clientType] = (acc[s.clientType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const clientTypeDistribution = Object.entries(clientTypeCounts).map(([clientType, count]) => ({
      clientType,
      count,
    }));

    return {
      totalSurveys,
      averageSqd,
      clientTypeDistribution,
      sqdAveragesPerQuestion,
    };
  }
}