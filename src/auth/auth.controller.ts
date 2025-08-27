import { Body, Controller, Delete, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, JwtPayload } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { GenerateVerifyCodeDto } from './dots/request/generate-verify-code.dto';
import { VerifyCodeResponseDto } from './response/vefiry-code.dto';
import { TokenResponseDto } from './dots/response/token-response.dto';
import { PhoneVerifyDto } from './dots/request/phone-verify.dto';
import { RefreshTokenRequestDto } from './dots/request/refresh-token-request.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface Tokens {
    accessToken: string;
    refreshToken: string;
}


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    private readonly IS_DEV: boolean;
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        this.IS_DEV = this.configService.get('NODE_ENV') === 'develop';
    }



    @HttpCode(201)
    @Post('request-code')
    @ApiOperation({ summary: '인증 코드 요청', description: '휴대폰 번호를 입력하여 인증 코드를 요청합니다.  \n 인증 코드는 5분 동안 유효합니다.' })
    @ApiBody({ type: GenerateVerifyCodeDto })
    @ApiResponse({ status: 201, description: '인증 코드 요청 성공', type: VerifyCodeResponseDto })
    @ApiResponse({ status: 400, description: '인증 코드 요청 실패' })
    @ApiResponse({ status: 500, description: '인증 코드 전송 실패' })
    async requestCode(@Body() dto: GenerateVerifyCodeDto) {
        const isUser = await this.authService.sendVerificationCode(dto.phoneNumber);
        return { isUser };
    }


    @HttpCode(201)
    @Post('phone/login')
    @ApiOperation({ summary: '휴대폰 로그인', description: '휴대폰 번호와 인증 코드를 입력하여 로그인합니다.' })
    @ApiBody({ type: PhoneVerifyDto })
    @ApiBearerAuth("Authorization")
    @ApiResponse({ status: 201, description: '휴대폰 로그인 성공', type: TokenResponseDto })
    @ApiResponse({ status: 401, description: '인증 코드 불일치' })
    @ApiResponse({ status: 404, description: '존재하지 않는 휴대폰 번호' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async phoneLogin(
        @Body() dto: PhoneVerifyDto
    ) {
        const tokens: Tokens = await this.authService.loginWithPhone(dto.phoneNumber, dto.code);
        return tokens;
    }

    @HttpCode(201)
    @Post('phone/signup')
    @ApiOperation({ summary: '휴대폰 회원가입', description: '휴대폰 번호와 인증 코드를 입력하여 회원가입합니다.' })
    @ApiBody({ type: PhoneVerifyDto })
    @ApiBearerAuth("Authorization")
    @ApiResponse({ status: 201, description: '휴대폰 회원가입 및 로그인 성공', type: TokenResponseDto })
    @ApiResponse({ status: 400, description: '이미 존재하는 휴대폰 번호' })
    @ApiResponse({ status: 401, description: '인증 코드 불일치' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async phoneSignup(
        @Body() dto: PhoneVerifyDto
    ) {
        const tokens: Tokens = await this.authService.signupWithPhone(dto.phoneNumber, dto.code);
        return tokens;
    }

    @HttpCode(200)
    @Post('refresh')
    @ApiOperation({ summary: '토큰 갱신', description: 'accessToken이 만료되었을 때 토큰을 갱신합니다.' })
    @ApiBody({ type: RefreshTokenRequestDto })
    @ApiBearerAuth("Authorization")
    @ApiResponse({ status: 200, description: '토큰 갱신 성공', type: TokenResponseDto })
    @ApiResponse({ status: 401, description: '토큰 갱신 실패' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async refreshToken(
        @Body() dto: RefreshTokenRequestDto
    ) {
        const tokens: Tokens = await this.authService.refreshToken(dto.refreshToken);
        return tokens;
    } 
}