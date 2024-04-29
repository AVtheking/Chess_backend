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
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from 'src/middlewares/ws.middleware';
import { GameService } from '../game.service';
// import {} from 'socket.io';
@WebSocketGateway()
export class gameGateWay
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly gameService: GameService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;
  // afterInit(server: any) {
  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware(this.jwtService) as any);
    console.log('init');
  }
  // }
  handleConnection() {
    console.log('connected');
    // return { event, data: 'connected' };
  }

  handleDisconnect() {
    console.log('disconnected');
    // return { event, data: 'disconnected' };
  }
  // @UseGuards(WsGuard)
  @SubscribeMessage('joinGame')
  handleGameJoin(
    @MessageBody() data: string,
    @ConnectedSocket() socket: any,
  ): WsResponse<unknown> {
    console.log(socket.user);
    const games = this.gameService.games;
    // console.log(games);
    const game = games.find((g) => g.gameId === data);
    // game.player2UserId=
    console.log(data);

    const event = 'gamejoined';
    return { event, data: 'game joined' };
  }
}
