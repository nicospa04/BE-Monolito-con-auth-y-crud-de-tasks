import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from '../../../application/users.service';
import { User } from '../../../domain/user';
import { BasicAuthGuard } from '../../../infrastructure/security/basic-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

type AuthenticatedRequest = Request & { user: User };

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registers a standard user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.usersService.register(dto));
  }

  @Get('me')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @ApiOperation({ summary: 'Returns the authenticated user' })
  @ApiOkResponse({ type: UserResponseDto })
  me(@Req() request: AuthenticatedRequest): UserResponseDto {
    return UserResponseDto.from(request.user);
  }
}
