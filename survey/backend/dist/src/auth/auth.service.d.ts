import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly prisma;
    constructor(jwtService: JwtService, configService: ConfigService, prisma: PrismaService);
    validateUser(username: string, password: string): Promise<{
        sub: string;
        role: string;
        username: string;
    }>;
    changePassword(username: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    login(user: {
        sub: string;
        role: string;
        username: string;
    }): Promise<{
        access_token: string;
    }>;
}
