import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

export class WorkspaceImageDto {
    @ApiProperty({ description: '워크스페이스 이미지 ID', example: '1' })
    id: string;
    @ApiProperty({ description: '워크스페이스 이미지 경로', example: 'https://d2pscyxwb18ctv.cloudfront.net/workspace/image.webp' })
    path: string;
    @ApiProperty({ description: '워크스페이스 이미지 이름', example: '파리바게트 강남점 이미지' })
    originalName: string;
}

export class WorkspaceOwnerUserDto {
    @ApiProperty({ description: '워크스페이스 주인 사용자 ID', example: '1' })
    id: string;
    @ApiProperty({ description: '워크스페이스 주인 사용자 이름', example: '파리바게트 강남점' })
    name: string;
}

export class WorkspaceCategoryDto {
    @ApiProperty({ description: '워크스페이스 카테고리 ID', example: '1' })
    id: string;
    @ApiProperty({ description: '워크스페이스 카테고리 이름', example: '파리바게트' })
    name: string;
}

export class DetailWorkspaceResponseDto {


    
    @ApiProperty({ description: '워크스페이스 ID', example: '1' })
    id: string;

    @ApiProperty({ description: '워크스페이스 이름', example: '파리바게트 강남점' })
    name: string;

    @ApiProperty({ description: '워크스페이스 주소', example: '서울시 강남구 강남대로 123' })
    address: string;

    @ApiProperty({ description: '워크스페이스 위도', example: 37.48509 })
    latitude: number;

    @ApiProperty({ description: '워크스페이스 경도', example: 126.8646 })
    longitude: number;
    
    @ApiProperty({ description: '워크스페이스 사업자 등록번호', example: '123456789012' })
    businessRegistrationNum: string;

    @ApiProperty({ description: '워크스페이스 주인 이름', example: '강남점 점장' })
    ownerName: string;

    @ApiProperty({ description: '워크스페이스 이미지 객체', type: [WorkspaceImageDto] })
    @IsArray()
    images: WorkspaceImageDto[];

    @ApiProperty({ description: '워크스페이스 주인 사용자 객체', type: WorkspaceOwnerUserDto })
    ownerUser: WorkspaceOwnerUserDto;

    @ApiProperty({ description: '워크스페이스 카테고리 객체', type: WorkspaceCategoryDto })
    category: WorkspaceCategoryDto;
}