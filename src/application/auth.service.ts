import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../domain/user';
import { UsersService } from './users.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private static readonly accessTokenTtl = '15m';
  private static readonly refreshTokenTtlDays = 7;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<AuthTokens> {
    let user: User;
    try {
      user = await this.usersService.getByUsername(username);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const user = await this.getUserForRefreshToken(refreshToken);
    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    const user = await this.getUserForRefreshToken(refreshToken);
    await this.usersService.clearRefreshToken(user.id);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, username: user.username },
      { expiresIn: AuthService.accessTokenTtl },
    );
    const refreshToken = `${user.id}.${randomUUID()}`;
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    const refreshTokenExpiresAt = new Date(
      Date.now() + AuthService.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    );
    await this.usersService.setRefreshToken(
      user.id,
      refreshTokenHash,
      refreshTokenExpiresAt,
    );
    return { accessToken, refreshToken };
  }

  private async getUserForRefreshToken(refreshToken: string): Promise<User> {
    const userId = Number(refreshToken.split('.', 1)[0]);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let user: User;
    try {
      user = await this.usersService.getById(userId);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (
      !user.refreshTokenHash ||
      !user.refreshTokenExpiresAt ||
      user.refreshTokenExpiresAt <= new Date() ||
      !(await bcrypt.compare(refreshToken, user.refreshTokenHash))
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return user;
  }
}
