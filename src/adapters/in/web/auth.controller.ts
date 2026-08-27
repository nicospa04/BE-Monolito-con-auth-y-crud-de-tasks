import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from '../../../application/users.service';
import { AuthService } from '../../../application/auth.service';
import { User } from '../../../domain/user';
import { JwtAuthGuard } from '../../../infrastructure/security/jwt-auth.guard';
import { AuthTokensResponseDto } from './dto/auth-tokens-response.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserResponseDto } from './dto/user-response.dto';

type AuthenticatedRequest = Request & { user: User };

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registers a standard user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.usersService.register(dto));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticates a user and returns JWT tokens' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  async login(@Body() dto: LoginUserDto): Promise<AuthTokensResponseDto> {
    return AuthTokensResponseDto.from(
      await this.authService.login(dto.username, dto.password),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotates a valid refresh token' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensResponseDto> {
    return AuthTokensResponseDto.from(
      await this.authService.refresh(dto.refreshToken),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revokes the current refresh token' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Returns the authenticated user' })
  @ApiOkResponse({ type: UserResponseDto })
  me(@Req() request: AuthenticatedRequest): UserResponseDto {
    return UserResponseDto.from(request.user);
  }
}
