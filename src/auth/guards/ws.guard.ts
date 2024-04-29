import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export class WsGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.switchToWs().getClient().handshake.headers.authorization) {
      console.log('headers found');
    }
    const client: Socket = context.switchToWs().getClient();
    const { authorization } = client.handshake.headers;
    console.log(authorization);
    return true;
  }

  // static ValidateToken(client: Socket) {
  //   const { authorization } = client.handshake.headers;
  //   console.log(authorization);
  //   if (!authorization) {
  //     throw new WsException('Unauthorized');
  //   }

  //   const token: string = authorization.split(' ')[1];
  //   console.log(token);
  //   const user = this.jwtService.verify(token);
  //   console.log(user);
  //   return user;
  // }
}
