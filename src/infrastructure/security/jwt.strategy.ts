import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../application/users.service';
import { User } from '../../domain/user';

interface JwtPayload {
  sub: number;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'development-only-change-me',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      return await this.usersService.getByUsername(payload.username);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
