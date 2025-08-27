// auth/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly configService: ConfigService
  ) {}

  private extractToken(req: any): string | null {
    const auth = req.headers?.authorization as string | undefined;
    if (!auth) return null;
    const [scheme, token] = auth.split(' ');
    return scheme?.toLowerCase() === 'bearer' && token ? token : null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException('Authorization 헤더의 Bearer 토큰이 없습니다.');

    try {
      const payload = await this.jwt.verifyAsync(token, { secret: this.configService.get<string>("JWT_ACCESS_SECRET") });
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }
  }
}
