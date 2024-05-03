import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';

import {
  Injectable,
  Logger,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from 'src/middlewares/ws.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { Game } from '../Game';
import { WebsocketExceptionsFilter } from './filter';

@Injectable()
@WebSocketGateway()
@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class GameGateWay
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  public games: Game[] = [];
  public static instance: GameGateWay;
  private readonly logger = new Logger('WS');
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;
  removeGame(gameId: string) {
    return this.games.filter((g) => g.gameId !== gameId);
  }
  afterInit(client: Socket) {
    //securing websockets with jwt
    client.use(SocketAuthMiddleware(this.jwtService) as any);
    this.logger.log('init');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`\x1b[34mClient connected: ${client.id}\x1b[1m`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`\x1b[34mClient disconnected: ${client.id}\x1b[1m`);
  }

  /*
   * handle Game Create
   * This method is used to create a game
   * @param socket - socket instance
   * @returns WsResponse<unknown>
   */
  @SubscribeMessage('createGame')
  handleGameCreate(@ConnectedSocket() socket: any): WsResponse<unknown> {
    const user = socket.user;

    const game = new Game(
      this.prismaService,

      user.userId,
    );

    this.games.push(game);

    //joining socket to game room
    socket.join(game.gameId);

    const event = 'gamecreated';

    this.logger.log(`\x1b[34mGame created: ${game.gameId}\x1b[1m`);
    return { event, data: game.gameId };
  }

  /*
   * handle Game Join
   * This method is used to join a game
   * @param data - gameId
   * @param socket - socket instance
   * @returns WsResponse<unknown>
   */

  @SubscribeMessage('joinGame')
  async handleGameJoin(
    @MessageBody() data: any,
    @ConnectedSocket() socket: any,
  ) {
    const gameId = data.gameId;
    const games = this.games;
    const userId = socket.user.userId;

    //finding the game in the games array for the user to join
    const game = games.find((g) => g.gameId === gameId);

    if (game === undefined) {
      this.server.to(socket.id).emit('error', 'game not found');
    }

    const gameInDb = await this.prismaService.game.findUnique({
      where: { id: data.gameId },
    });
    if (game.player1UserId === userId) {
      this.server.to(socket.id).emit('error', 'you cannot join your own game');
      return;
    }

    if (gameInDb) {
      this.server.to(socket.id).emit('error', 'game already started');
      return;
    }
    //joining socket to game room
    socket.join(gameId);

    game.addSecondPlayer(userId);

    this.server.to(socket.id).emit('gamejoined', gameId);

    this.logger.log(`\x1b[34m Client ${userId} Game joined: ${gameId}\x1b[1m`);

    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: [game.player1UserId, game.player2UserId],
        },
      },
    });
    // sending game joined event to all clients in the game room
    this.server.to(gameId).emit(
      'INIT_GAME',
      JSON.stringify({
        data: {
          gameId: game.gameId,
          whitePlayer: {
            id: game.player1UserId,
            name: users.find((u) => u.id === game.player1UserId).username,
          },
          blackPlayer: {
            id: game.player2UserId,
            name: users.find((u) => u.id === game.player2UserId).username,
          },
          fen: game.board.fen(),
        },
      }),
    );
    this.logger.log(`\x1b[34mGame started: ${gameId}\x1b[1m`);
  }
  @SubscribeMessage('makeMove')
  async makeMoveInGame(
    @MessageBody() data: any,
    @ConnectedSocket() socket: any,
  ) {
    const { gameId, move } = data;
    const userId = socket.user.userId;
    const game = this.games.find((g) => g.gameId === gameId);
    if (game === undefined) {
      this.server.to(socket.id).emit('GAME_NOT_FOUND', 'game not found');
      return;
    }
    const moveResult = game.makeMove(userId, move);
    if (moveResult) {
      this.server.to(gameId).emit(
        'MOVE',
        JSON.stringify({
          data: {
            from: move.from,
            to: move.to,
          },
        }),
      );
      this.logger.log(
        `\x1b[34m User :${userId} made move : ${move}  in game: ${gameId}\x1b[1m`,
      );
    }
    if (game.gameOver) {
      this.server.to(gameId).emit(
        'GAME_OVER',
        JSON.stringify({
          data: {
            result: game.result,
          },
        }),
      );
      this.logger.log(`\x1b[34mGame Over: ${gameId}\x1b[1m`);
      this.removeGame(gameId);
    }
  }
}
