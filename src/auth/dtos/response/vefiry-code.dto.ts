import { ApiProperty } from "@nestjs/swagger";

export class VerifyCodeResponseDto {
    @ApiProperty({ example: true })
    isUser: boolean;
}