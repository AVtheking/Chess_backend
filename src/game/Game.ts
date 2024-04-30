import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

export class Game {
  gameId: string;
  player1UserId: string;
  player2UserId: string | null;
  constructor(
    private prismaService: PrismaService,
    player1UserId: string,
    player2UserId?: string | null,
  ) {
    this.player1UserId = player1UserId;
    this.player2UserId = player2UserId;
    this.gameId = randomUUID();
  }

  async addSecondPlayer(player2UserId: string) {
    this.player2UserId = player2UserId;

    return await this.createGameInDb();
  }
  async createGameInDb() {
    const game = await this.prismaService.game.create({
      data: {
        id: this.gameId,
        whitePlayer: {
          connect: {
            id: this.player1UserId,
          },
        },
        status: 'IN_PROGRESS',
        blackPlayer: {
          connect: {
            id: this.player2UserId,
          },
        },
      },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      },
    });

    this.gameId = game.id;
    this.prismaService.$transaction([
      this.prismaService.user.update({
        where: {
          id: this.player1UserId,
        },
        data: {
          gameAsWhite: {
            connect: {
              id: this.gameId,
            },
          },
        },
      }),
      this.prismaService.user.update({
        where: {
          id: this.player2UserId,
        },
        data: {
          gameAsBlack: {
            connect: {
              id: this.gameId,
            },
          },
        },
      }),
    ]);

    return game;
  }
}
