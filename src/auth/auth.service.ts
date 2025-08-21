import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from 'nestjs-prisma';
import { combineDateAndTime, getKoreanDate } from 'src/utils/dateUtils';

@Injectable()
export class AuthService {
    private readonly IS_DEV: boolean;
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
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

        await this.prisma.authHistory.create({
            data: {
                phoneNumber,
                code,
                createDate: getKoreanDate(),
            }
        })
        const user = await this.prisma.user.findFirst({
            where: {
                phone:phoneNumber,
            }
        })
        return { isUser: !!user };
    }
}
