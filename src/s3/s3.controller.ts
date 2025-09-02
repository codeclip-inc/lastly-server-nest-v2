import { Body, Controller, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequestCreateS3UploadKeyDto } from './dtos/request/request-create-s3-upload-key.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/auth/auth.service';
import { ResponsePresignedDto } from './dtos/response/response-presigned.dto';

@Controller('s3')
export class S3Controller {
    private readonly IS_DEV: boolean;
    constructor(
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService
    ) {
        this.IS_DEV = this.configService.get('NODE_ENV') === 'develop';
    }

    @HttpCode(200)
    @Post("upload/request")
    @ApiOperation({ summary: '이미지 업로드를 위한 경로 발급', description: '메타데이터와 함께 경로 발급. \n 저장 가능한 이미지 포멧 - webp' })
    @ApiBody({ type: RequestCreateS3UploadKeyDto })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth("Authorization")
    @ApiResponse({status: 200, description: '이미지 업로드 경로 발급 완료', type: ResponsePresignedDto})
    @ApiResponse({status: 400, description: '이미지 포멧 불일치'})
    @ApiResponse({status: 400, description: '이미지 용량이 너무 큽니다. (최대 5MB)'})
    @ApiResponse({status: 500, description: '데이터베이스 저장 실패'})
    async createS3UploadKey(
        @Body() dto: RequestCreateS3UploadKeyDto,
        @Req() req: Request & { user: JwtPayload }
    ){
        return this.s3Service.createS3UploadKey(dto, BigInt(req.user.sub));
    }   
}
