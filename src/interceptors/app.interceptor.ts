import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const elapsedTime = Date.now() - now;
        this.logger.log(
          `\x1b[32m${method} ${url} ${statusCode} - ${elapsedTime}ms\x1b[1m`,
        );
      }),
      catchError((error) => {
        const status = error instanceof HttpException ? error.getStatus() : 500;
        // const exceptionResponse = error.getResponse();
        const elapsedTime = Date.now() - now;
        // Log the exception details
        this.logger.error(`${method} ${url} ${status} - ${elapsedTime}ms`);

        // Propagate the error to the caller
        return throwError(error);
      }),
    );
  }
}
