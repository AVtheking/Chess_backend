import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private logger = new Logger('RequestLogging');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    this.logger.log(
      ` \x1b[36m${method} ${originalUrl} from ${ip} - User Agent: ${userAgent} \x1b[1m`,
    );
    next();
  }
}
