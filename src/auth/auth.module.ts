import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { PrismaModule } from 'nestjs-prisma';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule, 
    ConfigModule,
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService]
})
export class AuthModule {}
