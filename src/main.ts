import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.setGlobalPrefix('api/v1');
  registerGlobals(app);
  0;
  await app.listen(3000);
  console.log('\x1b[33m \x1b[1m ');
}
export function registerGlobals(app: INestApplication) {
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
      excludeExtraneousValues: true,
    }),
  );
}

bootstrap();
