import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkspaceRequestDto } from './dtos/request/create-workspace-request.dto';
import { S3ImageTmpTableName, S3Service } from 'src/s3/s3.service';
import { getKoreanDate } from 'src/utils/dateUtils';
import { ConfigService } from '@nestjs/config';
import { DetailWorkspaceResponseDto, WorkspaceCategoryDto, WorkspaceOwnerUserDto } from './dtos/response/detail-workspace-response.dto';

@Injectable()
export class WorkspaceService {
    private readonly CLOUD_FRONT_URL: string;
    constructor(
        private readonly prisma: PrismaService,
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService,
    ) { 
        this.CLOUD_FRONT_URL = this.configService.get<string>("CLOUDFRONT_DOMAIN")!;
    }

    async createWorkspace(dto: CreateWorkspaceRequestDto, userId: bigint) {
        const {
            name,
            categoryId,
            address,
            latitude,
            longitude,
            businessRegistrationNum,
            imageIds,
            ownerName
        } = dto;
        const imageConfirmedResult = await this.s3Service.confirmS3ImageTmp(userId, imageIds.map(id => BigInt(id)), S3ImageTmpTableName.WORKSPACE);
        if (imageConfirmedResult.failed.length > 0) {
            throw new BadRequestException('이미지 검증 실패');
        }
        try {
            await this.prisma.$transaction(async (tx) => {
                const workspace = await tx.workspace.create({
                    data: {
                        name,
                        categoryId: BigInt(categoryId),
                        address,
                        latitude,
                        longitude,
                        businessRegistrationNum,
                        ownerName,
                        ownerUserId: userId,
                        createDate: getKoreanDate(),
                    }
                })          
                const imageData = imageConfirmedResult.success.map(image => ({
                    originalName: image.originalName,
                    key: image.path,
                    createDate: getKoreanDate(),
                    workspaceId: workspace.id,
                }));
                await tx.workspaceImage.createMany({
                    data: imageData,
                })
            })
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('워크스페이스 생성 실패');
        }
    }

    async getWorkspace(id: bigint) {
        const workspaceResult = await this.prisma.workspace.findUnique({
            where: { id },
            include: { 
                images: true, 
                ownerUser: true,
                category: true 
            },
        });
        const workspace: DetailWorkspaceResponseDto = {
            id: workspaceResult?.id.toString() || '',
            name: workspaceResult?.name || '',
            address: workspaceResult?.address || '',
            latitude: workspaceResult?.latitude || 0,
            longitude: workspaceResult?.longitude || 0,
            businessRegistrationNum: workspaceResult?.businessRegistrationNum || '',
            ownerName: workspaceResult?.ownerName || '',
            ownerUser: workspaceResult?.ownerUser as unknown as WorkspaceOwnerUserDto,
            category: workspaceResult?.category as unknown as WorkspaceCategoryDto,
            images: workspaceResult?.images.map(image => ({
                id: image.id.toString(),
                originalName: image.originalName,
                path: this.CLOUD_FRONT_URL + image.key,
            })) || [],
        };
        return workspace;
    }
}