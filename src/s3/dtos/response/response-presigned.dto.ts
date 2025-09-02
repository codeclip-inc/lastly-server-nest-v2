import { ApiProperty } from "@nestjs/swagger";

export class ResponsePresignedDto {
    @ApiProperty({ description: '이미지 임시 아이디' })
    id: bigint;

    @ApiProperty({ description: '필드 정보' })
    fields: Record<string, string>;

    @ApiProperty({ description: '업로드 URL' })
    url: string;
}