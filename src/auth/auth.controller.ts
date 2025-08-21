import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiInternalServerErrorResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { GenerateVerifyCodeDto } from './dots/request/generate-verify-code.dto';
import { VerifyCodeResponseDto } from './response/vefiry-code.dto';

interface Tokens {
    accessToken: string;
    refreshToken: string;
}


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    private readonly IS_DEV: boolean;
    private readonly COOKIE_OPTIONS: {
        httpOnly: boolean;
        sameSite: 'lax' | 'none';
        secure: boolean;
    };
    private readonly REFRESH_TOKEN_MAX_AGE: number;
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        this.IS_DEV = this.configService.get('NODE_ENV') === 'develop';
        this.COOKIE_OPTIONS = {
            httpOnly: true,
            sameSite: this.IS_DEV ? ('lax' as const) : ('none' as const),
            secure: !this.IS_DEV,
        };
        this.REFRESH_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * this.configService.get('REFRESH_TOKEN_MAX_AGE_DAYS');
    }

    private setAuthCookies(res: Response, tokens: Tokens) {
        res.cookie('accessToken', tokens.accessToken, this.COOKIE_OPTIONS);
        res.cookie('refreshToken', tokens.refreshToken, {...this.COOKIE_OPTIONS, maxAge: this.REFRESH_TOKEN_MAX_AGE});
    }
    private clearAuthCookies(res: Response) {
        res.clearCookie('accessToken', this.COOKIE_OPTIONS);
        res.clearCookie('refreshToken', {...this.COOKIE_OPTIONS, maxAge: 0});
    }

    @HttpCode(201)
    @Post('request-code')
    @ApiOperation({ summary: '인증 코드 요청' })
    @ApiBody({ type: GenerateVerifyCodeDto })
    @ApiResponse({ status: 201, description: '인증 코드 요청 성공', type: VerifyCodeResponseDto })
    @ApiBadRequestResponse({ description: '인증 코드 요청 실패' })
    @ApiInternalServerErrorResponse({ description: '인증 코드 전송 실패' })
    async requestCode(@Body() dto: GenerateVerifyCodeDto) {
        return this.authService.sendVerificationCode(dto.phoneNumber);
    }
}