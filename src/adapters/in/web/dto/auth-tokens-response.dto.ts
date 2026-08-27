import { ApiProperty } from '@nestjs/swagger';
import { AuthTokens } from '../../../../application/auth.service';

export class AuthTokensResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  static from(tokens: AuthTokens): AuthTokensResponseDto {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
