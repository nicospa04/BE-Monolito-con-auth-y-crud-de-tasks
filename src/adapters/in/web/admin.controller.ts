import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../../../domain/role';
import { JwtAuthGuard } from '../../../infrastructure/security/jwt-auth.guard';
import { Roles } from '../../../infrastructure/security/roles.decorator';
import { RolesGuard } from '../../../infrastructure/security/roles.guard';

@ApiTags('Administration')
@ApiBearerAuth()
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('health')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin-only endpoint used to verify authorization' })
  @ApiOkResponse({ schema: { example: { status: 'admin access granted' } } })
  health(): { status: string } {
    return { status: 'admin access granted' };
  }
}
