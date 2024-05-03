import { Logger } from '@nestjs/common';
import { Chess, Move } from 'chess.js';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

type GAME_RESULT = 'DRAW' | 'WHITE_WON' | 'BLACK_WON';
type GAME_STATUS = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
function isPromoting(chess: Chess, move) {
  const piece = chess.get(move.from);

  if (piece?.type !== 'p') {
    return false;
  }

  if (piece.color !== chess.turn()) {
    return false;
  }

  if (!['1', '8'].some((it) => move.to.endsWith(it))) {
    return false;
  }

  return chess
    .moves({ square: move.from, verbose: true })
    .map((it) => it.to)
    .includes(move.to);
}
export class Game {
  gameId: string;
  player1UserId: string;
  player2UserId: string | null;
  board: Chess;
  gameOver: boolean;
  result: GAME_RESULT;
  private readonly logger = new Logger('Game');
  constructor(
    private prismaService: PrismaService,

    player1UserId: string,
    player2UserId?: string | null,
  ) {
    this.player1UserId = player1UserId;
    this.player2UserId = player2UserId;
    this.gameId = randomUUID();
    this.board = new Chess();
    this.gameOver = false;
  }

  async addSecondPlayer(player2UserId: string) {
    this.player2UserId = player2UserId;

    try {
      await this.createGameInDb();
    } catch (error) {
      this.logger.log(error);
      return;
    }
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
    this.logger.log(`Game created in db with id: ${game.id}`);
    this.gameId = game.id;
    // this.prismaService.$transaction([
    //   this.prismaService.user.update({
    //     where: {
    //       id: this.player1UserId,
    //     },
    //     data: {
    //       gameAsWhite: {
    //         connect: {
    //           id: this.gameId,
    //         },
    //       },
    //     },
    //   }),
    //   this.prismaService.user.update({
    //     where: {
    //       id: this.player2UserId,
    //     },
    //     data: {
    //       gameAsBlack: {
    //         connect: {
    //           id: this.gameId,
    //         },
    //       },
    //     },
    //   }),
    // ]);
  }
  async makeMove(userId: string, move: Move): Promise<boolean> {
    if (this.board.turn() === 'w' && userId !== this.player1UserId) {
      return false;
    }
    if (this.board.turn() === 'b' && userId !== this.player2UserId) {
      return false;
    }
    if (isPromoting(this.board, move)) {
      this.board.move({
        from: move.from,
        to: move.to,
        promotion: 'q',
      });
    } else {
      this.board.move({
        from: move.from,
        to: move.to,
      });
    }

    if (this.board.isGameOver()) {
      this.gameOver = true;
      this.result = this.board.isDraw()
        ? 'DRAW'
        : this.board.turn() === 'w'
          ? 'BLACK_WON'
          : 'WHITE_WON';
      this.endGame('COMPLETED', this.result);
    }
    return true;
  }
  async endGame(status: GAME_STATUS, result: GAME_RESULT) {
    await this.prismaService.game.update({
      where: {
        id: this.gameId,
      },
      data: {
        status,
        result,
      },
    });
  }
}
