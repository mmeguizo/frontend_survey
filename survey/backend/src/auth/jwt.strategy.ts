import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'chmsu-survey-secret-key-2024',
      passReqToCallback: false,
    });
  }

  async validate(payload: { sub: string; role: string }) {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Invalid token');
    }
    return { userId: payload.sub, role: payload.role };
  }
}