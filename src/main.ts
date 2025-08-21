import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('LastLy API')
  .setDescription("라스트리 백엔드 서버")
  .addCookieAuth('accessToken', {
    type: 'http',
    in: 'cookie',
    name: 'Access Token',
  })
  .addCookieAuth('refreshToken', {
    type: 'http',
    in: 'cookie',
    name: 'Refresh Token',
  })
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: false,
    credentials: true,
  });
 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
