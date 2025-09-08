import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class KakaoLoginDto {
    @ApiProperty({ description: '카카오 엑세스 토큰' })
    @IsString()
    accessToken: string;
}