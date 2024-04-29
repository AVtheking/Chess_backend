import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}
  @UseGuards(AuthGuard)
  @Post('create')
  async createGame(@Req() req: any, @Res() res: Response) {
    const userId = req.user;
    return await this.gameService.createGame(userId, res);
  }
}
