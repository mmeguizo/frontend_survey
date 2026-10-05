import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(username: string, password: string) {
    const stored = await this.prisma.adminUser.findUnique({ where: { username } });

    if (stored) {
      const matches = await bcrypt.compare(password, stored.passwordHash);
      if (!matches) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return { sub: stored.username, role: 'admin', username: stored.username };
    }

    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (username !== adminUsername || password !== adminPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { sub: 'admin', role: 'admin', username };
  }

  async changePassword(username: string, currentPassword: string, newPassword: string) {
    await this.validateUser(username, currentPassword);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.adminUser.upsert({
      where: { username },
      update: { passwordHash },
      create: { username, passwordHash },
    });
    return { message: 'Password updated successfully' };
  }

  async login(user: { sub: string; role: string; username: string }) {
    const payload = { sub: user.sub, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
