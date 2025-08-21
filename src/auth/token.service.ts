// src/auth/jwt.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: bigint,
  role: string
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: NestJwtService,
    private readonly configService: ConfigService
  ) { }

  generateAccessToken(userId: bigint) {
    return this.jwt.sign(
      { sub: userId.toString() },
      {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRES_IN"),
      },
    );
  }

  generateRefreshToken(userId: bigint) {
    return this.jwt.sign(
      { sub: userId.toString() },
      {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN"),
      },
    );
  }

  verifyAccessToken(token: string): JwtPayload | null {
    try {
      return this.jwt.verify(token, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
      }) as JwtPayload;
    } catch (e) {
      return null;
    }
  }


  verifyRefreshToken(token: string) {
    try {
      return this.jwt.verify(token, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      }) as JwtPayload;
    } catch (e) {
      return null;
    }
  }

  decodeToken(token: string) {
    return this.jwt.decode(token);
  }
}
