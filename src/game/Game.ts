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
    });

    this.gameId = game.id;
    return game;
  }
}
