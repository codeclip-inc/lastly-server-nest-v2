import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class PhoneVerifyDto {
    @ApiProperty({ description: '휴대폰 번호', example: '01012345678' })
    @IsString()
    phoneNumber: string;

    @ApiProperty({ description: '인증 코드', example: '111111' })
    @IsString()
    code: string;
}