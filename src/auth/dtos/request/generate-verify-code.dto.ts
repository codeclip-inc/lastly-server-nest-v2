import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class GenerateVerifyCodeDto {
    @ApiProperty({ example: "01012345678" })
    @IsString()
    phoneNumber: string;
}