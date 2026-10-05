import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

const mockJwtService = {
  sign: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockPrismaService = {
  adminUser: {
    findUnique: jest.fn().mockResolvedValue(null),
    upsert: jest.fn().mockResolvedValue({}),
  },
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigService.get.mockImplementation((key: string) => {
      const env: Record<string, string> = {
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'password',
      };
      return env[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser()', () => {
    it('returns user when credentials are valid', async () => {
      const result = await service.validateUser('admin', 'password');
      expect(result).toEqual({ sub: 'admin', role: 'admin', username: 'admin' });
    });

    it('throws UnauthorizedException when credentials are invalid', async () => {
      await expect(service.validateUser('admin', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login()', () => {
    it('returns JWT token when user is valid', async () => {
      mockJwtService.sign.mockReturnValue('signed-jwt-token');
      const result = await service.login({ sub: 'admin', role: 'admin', username: 'admin' });
      expect(result.access_token).toBeDefined();
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });
});