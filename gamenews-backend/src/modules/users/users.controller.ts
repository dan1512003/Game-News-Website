import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from './users.service.js';
import { QueryUsersDto } from './dto/query-users.dto/query-users.dto.js';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}
 @Get('dashboard-stats')
  getDashboardStats() {
    return this.usersService.getDashboardStats();
  }
  // Danh sách người dùng
  @Get()
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  // Chi tiết người dùng
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Cập nhật role và status
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.update(
      id,
      dto,
      req.user,
    );
  }

  // Xóa người dùng
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}