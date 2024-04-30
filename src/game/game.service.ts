import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Utils } from 'src/utils/utils';

@Injectable()
export class GameService {
  constructor(
    private prismaService: PrismaService,
    private utils: Utils,
  ) {}
  // async createGame(userId: string, res: Response) {
  //   const game = new Game(this.prismaService, userId);
  //   this.games.push(game);
  //   console.log(this.games);
  //   console.log(game.gameId);
  //   return this.utils.sendHttpResponse(
  //     true,
  //     HttpStatus.OK,
  //     'Game created successfully',
  //     { gameId: game.gameId },
  //     res,
  //   );
  // }
  // async joinGame(gameId: string) {
  //   const game = this.games.find((g) => g.gameId === gameId);
  //   if (!game) {
  //    throw NotFound
  //   }
  //   return game.joinGame();
  // }
}
