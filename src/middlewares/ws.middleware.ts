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
        client.emit('auth_error', { code: 401, message: 'No token found' });
        client.disconnect(true); // Disconnect the client
        return;
      }
      const token: string = authorization.split(' ')[1];
      const user = jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      console.log(user);
      if (!user) {
        next(new WsException('Unauthorized'));
        client.emit('auth_error', { code: 401, message: 'Unauthorized' });
        client.disconnect(true); // Disconnect the client
        return;
      }
      client = Object.assign(client, { user });
      next();
    } catch (error) {
      next(new WsException(error));

      console.error('SocketAuthMiddleware Error:', error);

      client.emit('server_error', {
        code: 500,
        message: 'Internal Server Error',
      });
      client.disconnect(true); // Disconnect the client
      return;
    }
  };
};
