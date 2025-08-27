import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenRequestDto {
    @ApiProperty({ description: 'refreshToken' })
    refreshToken: string;
}