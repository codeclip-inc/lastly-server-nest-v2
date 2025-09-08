import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateWorkspaceRequestDto {
    @ApiProperty({ description: '워크스페이스 이름', example: '파리바게트 강남점' })
    @IsString()
    name: string;
    @ApiProperty({ description: '워크스페이스 주인 이름', example: '강남점 점장' })
    @IsString()
    ownerName: string;
    @ApiProperty({ description: "워크스페이스 카테고리 ID", example: 1 })
    @IsString()
    categoryId: string;
    @ApiProperty({ description: "워크스페이스 주소", example: "서울시 강남구 강남대로 123" })
    @IsString()
    address: string;
    @ApiProperty({ description: "워크스페이스 위도", example: 37.48509 })
    @IsNumber()
    latitude: number;
    @ApiProperty({ description: "워크스페이스 경도", example: 126.8646 })
    @IsNumber()
    longitude: number;
    @ApiProperty({ description: "워크스페이스 사업자 등록번호", example: "123456789012" })
    @IsString()
    businessRegistrationNum: string;
    @ApiProperty({ description: "워크스페이스 이미지 ID", example: ["1", "2", "3"] })
    @IsArray()
    imageIds: string[];
}