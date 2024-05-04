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
  @SubscribeMessage('CREATE_GAME')
  handleGameCreate(@ConnectedSocket() socket: any) {
    const user = socket.user;

    const game = new Game(
      this.prismaService,

      user.userId,
    );

    this.games.push(game);

    //joining socket to game room
    socket.join(game.gameId);

    // const event = 'GAME_CREATED';

    this.logger.log(`\x1b[34mGame created: ${game.gameId}\x1b[1m`);
    this.server.to(socket.id).emit('GAME_CREATED', game.gameId);
  }

  /*
   * handle Game Join
   * This method is used to join a game
   * @param data - gameId
   * @param socket - socket instance
   * @returns WsResponse<unknown>
   */

  @SubscribeMessage('JOIN_GAME')
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

    this.server.to(socket.id).emit('GAME_JOINED', gameId);

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

  /*
   * handle Make Move In Game
   * This method is used to make a move in a game
   * @param data - gameId and move
   * @param socket - socket instance
   * @returns void7
   */
  @SubscribeMessage('MAKE_MOVE')
  async makeMoveInGame(
    @MessageBody() data: any,
    @ConnectedSocket() socket: any,
  ) {
    console.log(data);
    const moveData = JSON.parse(data);
    console.log(moveData.data);
    const { gameId, from, to } = moveData.data;
    console.log(gameId, from, to);
    const userId = socket.user.userId;
    const game = this.games.find((g) => g.gameId === gameId);
    if (game === undefined) {
      this.server.to(socket.id).emit('GAME_NOT_FOUND', 'game not found');
      return;
    }

    //making move in the game
    const moveResult = game.makeMove(userId, from, to);
    if (moveResult) {
      this.server.to(gameId).emit(
        'MOVE',
        JSON.stringify({
          data: {
            from: from,
            to: to,
            fen: game.board.fen(),
          },
        }),
      );
      this.logger.log(
        `\x1b[34m User :${userId} made move from : ${from}  to :${to} in game: ${gameId}\x1b[1m`,
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
