import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
export type SocketMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (
  jwtService: JwtService,
): SocketMiddleware => {
  return async (client: Socket, next) => {
    try {
      const authorization = client.handshake.headers.authorization;
      if (!authorization) {
        next(new WsException('Unauthorized'));
        return;
      }
      const token: string = authorization.split(' ')[1];
      const user = jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      if (!user) {
        next(new WsException('Unauthorized'));
        return;
      }
      client = Object.assign(client, { user });
      next();
    } catch (error) {
      next(new WsException(error));

      console.error('SocketAuthMiddleware Error:', error);

      return;
    }
  };
};
