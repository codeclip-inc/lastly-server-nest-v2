import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class RequestCreateS3UploadKeyDto {
    @ApiProperty({description: "이미지 용량", example: 1024})
    @IsNumber()
    @IsNotEmpty()
    byteSize: number;

    @ApiProperty({description: "이미지 포멧", example: "image/webp"})
    @IsString()
    @IsNotEmpty()
    format: string;

    @ApiProperty({description: "이미지 원본 이름", example: "사진.jpeg"})
    @IsString()
    @IsNotEmpty()
    originalName: string;
}