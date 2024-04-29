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
      //   console.log(authorization);
      if (!authorization) {
        throw new WsException('Unauthorized');
      }
      const token: string = authorization.split(' ')[1];
      //   console.log(token);
      const user = jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      //   console.log(user);
      if (!user) {
        throw new WsException('Unauthorized');
      }
      client = Object.assign(client, { user });

      next();
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  };
};
