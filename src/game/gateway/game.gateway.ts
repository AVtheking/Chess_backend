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

import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from 'src/middlewares/ws.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { Game } from '../Game';
import { GameService } from '../game.service';
import { WebsocketExceptionsFilter } from './filter';

@WebSocketGateway()
@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class gameGateWay
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  public games: Game[] = [];
  private readonly logger = new Logger('WS');
  constructor(
    private readonly gameService: GameService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware(this.jwtService) as any);
    console.log('init');
  }
  // }
  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`\x1b[34mClient connected: ${client.id}\x1b[1m`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`\x1b[34mClient disconnected: ${client.id}\x1b[1m`);
  }

  @SubscribeMessage('createGame')
  handleGameCreate(@ConnectedSocket() socket: any): WsResponse<unknown> {
    const user = socket.user;

    const game = new Game(this.prismaService, user.userId);

    this.games.push(game);

    //joining socket to game room
    socket.join(game.gameId);

    const event = 'gamecreated';

    this.logger.log(`\x1b[34mGame created: ${game.gameId}\x1b[1m`);
    return { event, data: game.gameId };
  }

  /*
   * handleGameJoin
   * This method is used to join a game
   * @param data - gameId
   * @param socket - socket instance
   * @returns WsResponse<unknown>
   */

  @SubscribeMessage('joinGame')
  async handleGameJoin(
    @MessageBody() data: any,
    @ConnectedSocket() socket: any,
  ): Promise<WsResponse<unknown>> {
    const gameId = data.gameId;
    const games = this.games;

    const game = games.find((g) => g.gameId === gameId);

    if (game === undefined) {
      return { event: 'error', data: 'game not found' };
    }

    const gameInDb = await this.prismaService.game.findUnique({
      where: { id: data.gameId },
    });
    if (game.player1UserId === socket.user.userId) {
      this.server.emit('error', 'you cannot join your own game');
      return;
    }

    if (gameInDb) {
      this.server.to(socket.id).emit('error', 'game already started');
      return;
    }
    //joining socket to game room
    socket.join(gameId);

    game.addSecondPlayer(socket.user.userId);

    //sending game joined event to all clients in the game room
    this.server.to(gameId).emit('gamejoined', 'game joined');
  }
}
