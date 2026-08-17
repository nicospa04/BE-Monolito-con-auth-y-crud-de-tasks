import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../../../domain/role';
import { BasicAuthGuard } from '../../../infrastructure/security/basic-auth.guard';
import { Roles } from '../../../infrastructure/security/roles.decorator';
import { RolesGuard } from '../../../infrastructure/security/roles.guard';

@ApiTags('Administration')
@ApiBasicAuth()
@Controller('api/admin')
@UseGuards(BasicAuthGuard, RolesGuard)
export class AdminController {
  @Get('health')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin-only endpoint used to verify authorization' })
  @ApiOkResponse({ schema: { example: { status: 'admin access granted' } } })
  health(): { status: string } {
    return { status: 'admin access granted' };
  }
}
