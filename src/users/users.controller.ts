import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getUsers(@Req() req: any, @Res() res: Response) {
    return await this.usersService.getUserById(req.user, res);
  }
}
