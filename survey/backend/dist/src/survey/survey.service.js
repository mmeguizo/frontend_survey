"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SurveyService = class SurveyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submitSurvey(dto) {
        const ticketId = dto.ticketId ?? `SURVEY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const existing = dto.ticketId
            ? await this.prisma.survey.findUnique({ where: { ticketId: dto.ticketId } })
            : null;
        if (existing) {
            throw new common_1.ConflictException('Survey already exists for this ticketId');
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
    async getSurveys(page, limit, search) {
        const where = search
            ? {
                OR: [
                    { ticketId: { contains: search, mode: 'insensitive' } },
                    { emailAddress: { contains: search, mode: 'insensitive' } },
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
    async getSurveyById(id) {
        const survey = await this.prisma.survey.findUnique({ where: { id } });
        if (!survey) {
            throw new common_1.NotFoundException(`Survey with id ${id} not found`);
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
        const sqdFields = ['sqd0', 'sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'];
        const sqdAveragesPerQuestion = {};
        let totalSqdSum = 0;
        let totalSqdCount = 0;
        for (const field of sqdFields) {
            const values = allSurveys
                .map(s => s[field])
                .filter((v) => v !== null && v !== undefined);
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
        }, {});
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
};
exports.SurveyService = SurveyService;
exports.SurveyService = SurveyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SurveyService);
//# sourceMappingURL=survey.service.js.map