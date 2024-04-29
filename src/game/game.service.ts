import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { Utils } from 'src/utils/utils';
import { Game } from './Game';

@Injectable()
export class GameService {
  public games: Game[] = [];
  constructor(
    private prismaService: PrismaService,
    private utils: Utils,
  ) {}
  async createGame(userId: string, res: Response) {
    const game = new Game(this.prismaService, userId);
    this.games.push(game);
    console.log(game.gameId);
    return this.utils.sendHttpResponse(
      true,
      HttpStatus.OK,
      'Game created successfully',
      { gameId: game.gameId },
      res,
    );
  }
  // async joinGame(gameId: string) {
  //   const game = this.games.find((g) => g.gameId === gameId);
  //   if (!game) {
  //    throw NotFound
  //   }
  //   return game.joinGame();
  // }
}
