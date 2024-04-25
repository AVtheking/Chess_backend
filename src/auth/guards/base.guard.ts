import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export abstract class BaseGuard implements CanActivate {
  private readonly logger = new Logger();

  constructor(
    private jwtService: JwtService,
    private jwtSecret: any,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const start = Date.now(); // Start time

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        const decodedToken = this.jwtService.verify(token, {
          secret: this.jwtSecret.secret,
        });
        request.user = decodedToken.userId;

        return true;
      } catch (error) {
        const elapsed = Date.now() - start; // Elapsed time in milliseconds
        this.logRequest(request, 401, elapsed); // Log the failed request

        response.status(401).json({
          success: false,
          message: 'Invalid token',
        });
        return false;
      }
    } else {
      const elapsed = Date.now() - start; // Elapsed time in milliseconds
      this.logRequest(request, 401, elapsed); // Log the failed request (token not found)

      response.status(401).json({
        success: false,
        message: 'Token not found',
      });
      return false;
      //   throw new UnauthorizedException('Token not found');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    console.log(type, token);
    return type === 'Bearer' ? token : undefined;
  }

  private logRequest(
    request: Request,
    statusCode: number,
    elapsed: number,
  ): void {
    const method = request.method;
    const url = request.url;

    this.logger.log(`${method} ${url} ${statusCode} - ${elapsed}ms`);
  }
}
