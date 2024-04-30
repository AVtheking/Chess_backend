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

import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
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
  handleConnection() {
    console.log('connected');
  }

  handleDisconnect() {
    console.log('disconnected');
  }

  @SubscribeMessage('createGame')
  handleGameCreate(@ConnectedSocket() socket: any): WsResponse<unknown> {
    const user = socket.user;

    const game = new Game(this.prismaService, user.userId);
    this.games.push(game);

    const event = 'gamecreated';
    return { event, data: game.gameId };
  }

  @SubscribeMessage('joinGame')
  async handleGameJoin(
    @MessageBody() data: any,
    @ConnectedSocket() socket: any,
  ): Promise<WsResponse<unknown>> {
    // console.log(socket.user);

    const gameId = data.gameId;
    const games = this.games;

    // console.log(data.gameId);
    const game = games.find((g) => g.gameId === gameId);
    // console.log(`game found: ${game}`);
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
    // console.log(`this is the game in db ${gameInDb}`);
    if (gameInDb) {
      this.server.to(socket.id).emit('error', 'game already started');
      return;
    }
    game.addSecondPlayer(socket.user.userId);

    this.server.send('gamejoined', 'game joined');
  }
}
