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
    console.log(this.player2UserId);

    return await this.createGameInDb();
  }
  async createGameInDb() {
    console.log(`This is the player 1 id: ${this.player1UserId} `);
    console.log(`This is the player 2 id: ${this.player2UserId} `);

    const user1 = await this.prismaService.user.findUnique({
      where: {
        id: this.player1UserId,
      },
    });
    const user2 = await this.prismaService.user.findUnique({
      where: {
        id: this.player2UserId,
      },
    });
    console.log(`This is the user 1: ${user1} `);
    console.log(`This is the user 2: ${user2} `);
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
    });
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
    });
    return game;
  }
}
