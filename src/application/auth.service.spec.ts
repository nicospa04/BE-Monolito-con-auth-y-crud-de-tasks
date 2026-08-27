import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Test } from '@nestjs/testing';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

import { Role } from '../domain/role';
import { User } from '../domain/user';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  type SetRefreshToken = (
    userId: number,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ) => Promise<void>;

  const user: User = {
    id: 7,
    username: 'nico',
    email: 'nico@example.com',
    passwordHash: '',
    roles: [Role.USER],
    refreshTokenHash: null,
    refreshTokenExpiresAt: null,
  };
  const setRefreshToken = jest.fn<SetRefreshToken>();
  const usersService = {
    getByUsername: jest.fn<() => Promise<User>>(),
    getById: jest.fn<() => Promise<User>>(),
    setRefreshToken,
    clearRefreshToken: jest.fn<() => Promise<void>>(),
  };
  const jwtService = {
    signAsync: jest.fn<(payload: object) => Promise<string>>(),
  };
  let service: AuthService;
  let storedRefreshTokenHash: string | undefined;

  beforeEach(async () => {
    jest.clearAllMocks();
    user.passwordHash = await bcrypt.hash('password123', 4);
    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
    usersService.getByUsername.mockResolvedValue(user);
    usersService.getById.mockResolvedValue(user);
    storedRefreshTokenHash = undefined;
    setRefreshToken.mockImplementation(
      (_userId: number, refreshTokenHash: string) => {
        storedRefreshTokenHash = refreshTokenHash;
        return Promise.resolve();
      },
    );
    usersService.clearRefreshToken.mockResolvedValue(undefined);
    jwtService.signAsync.mockResolvedValue('access.jwt.token');

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('issues an access token and persists a hashed refresh token after valid login', async () => {
    const tokens = await service.login('nico', 'password123');

    expect(tokens.accessToken).toBe('access.jwt.token');
    expect(tokens.refreshToken).toMatch(/^7\./);
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: 7, username: 'nico' },
      expect.any(Object),
    );
    expect(setRefreshToken).toHaveBeenCalledWith(
      7,
      expect.any(String),
      expect.any(Date),
    );
    if (!storedRefreshTokenHash) {
      throw new Error('Refresh token hash was not stored');
    }
    expect(
      await bcrypt.compare(tokens.refreshToken, storedRefreshTokenHash),
    ).toBe(true);
  });

  it('rejects an invalid password', async () => {
    await expect(
      service.login('nico', 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a refresh token that does not match the stored session', async () => {
    user.refreshTokenHash = await bcrypt.hash('7.different-token', 4);
    user.refreshTokenExpiresAt = new Date(Date.now() + 60_000);

    await expect(service.refresh('7.wrong-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
