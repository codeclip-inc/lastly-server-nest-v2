import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from 'nestjs-prisma';
import { combineDateAndTime, getKoreanDate } from 'src/utils/dateUtils';
import { LoginProvider, User } from '@prisma/client';               
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
    sub: string,
    provider: LoginProvider
}

@Injectable()
export class AuthService {
    private readonly IS_DEV: boolean;
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) {
        this.IS_DEV = this.configService.get<string>("NODE_ENV") === "develop";
    }

    async sendVerificationCode(phoneNumber: string) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const today = getKoreanDate();
        const history = await this.prisma.authHistory.findMany({
            where: {
                phoneNumber,
                createDate: {
                    gte: combineDateAndTime(today, '00:00:00'),
                    lte: combineDateAndTime(today, '23:59:59'),
                }
            }
        })
        if (!this.IS_DEV && history.length >= 10) {
            throw new BadRequestException('하루에 10번 이상 인증 코드를 요청할 수 없습니다.');
        }
        if (!this.IS_DEV) {
            try {
                const response = await axios.post("https://apis.aligo.in/send/",
                    {
                        key: this.configService.get<string>("ALIGO_KEY"),
                        user_id: "codeclip",
                        sender: "031-376-2399",
                        receiver: phoneNumber,
                        msg: `[LastLy]\n인증번호는 ${code} 입니다.`
                    },
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                )
            } catch (error) {
                console.error(error);
                throw new InternalServerErrorException('인증 코드 전송에 실패했습니다.');
            }
        }

        await this.prisma.authHistory.create({
            data: {
                phoneNumber,
                code,
                createDate: getKoreanDate(),
            }
        })
        const user = await this.prisma.user.findFirst({
            where: {
                phone: phoneNumber,
            }
        })
        return !!user;
    }
    async loginWithPhone(phoneNumber: string, code: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                phone: phoneNumber,
            }
        })

        
        if (!user) {
            throw new NotFoundException('존재하지 않는 휴대폰 번호입니다.');
        }

        const authHistory = await this.prisma.authHistory.findFirst({
            where: {
                phoneNumber,
                code
            }
        })

        if (this.IS_DEV) {
            if ("111111" !== code) {
                throw new BadRequestException('인증 코드가 일치하지 않습니다.');
            }
        } else {
            if (!authHistory || authHistory.code !== code) {
                throw new BadRequestException('인증 코드가 일치하지 않습니다.');
            }
        }


        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginDate: getKoreanDate() }
        })
        return this.generateTokens(user);
    }
    async signupWithPhone(phoneNumber: string, code: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                phone: phoneNumber,
                provider: LoginProvider.PHONE,
            }
        })
        if (user) {
            throw new BadRequestException('이미 존재하는 휴대폰 번호입니다.');
        }
        const authHistory = await this.prisma.authHistory.findFirst({
            where: {
                phoneNumber,
                code,
                createDate: {
                    gte: new Date(getKoreanDate().getTime() - 5 * 60 * 1000),
                },
            }
        })
        if (this.IS_DEV) {
            if ("111111" !== code) {
                throw new BadRequestException('인증 코드가 일치하지 않습니다.');
            }
        } else {
            if (!authHistory || authHistory.code !== code) {
                throw new BadRequestException('인증 코드가 일치하지 않습니다.');
            }
        }
        const newUser = await this.prisma.user.create({
            data: {
                phone: phoneNumber,
                provider: LoginProvider.PHONE,
                name: phoneNumber,
                createDate: getKoreanDate(),
                lastLoginDate: getKoreanDate(),
            }
        })
        return this.generateTokens(newUser);
    }
    async refreshToken(refreshToken: string) {
        const decoded = this.jwtService.verify(refreshToken);
        const user = await this.prisma.user.findFirst({
            where: {
                id: decoded.sub,
                refreshToken: refreshToken,
            }
        })
        if (!user) {
            throw new UnauthorizedException('토큰 갱신 실패');
        }
        return this.generateTokens(user);
    }

    async generateTokens(user: User) {
        const payload: JwtPayload = {
            sub: user.id.toString(),
            provider: user.provider
        }
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '1d' });
        return { accessToken, refreshToken };
    }
}
