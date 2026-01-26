import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || "jwt_secret_key",
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // This payload comes from the JWT token
    // Whatever you return here gets attached to req.user
    return { userId: payload.sub, email: payload.email };
  }
}
