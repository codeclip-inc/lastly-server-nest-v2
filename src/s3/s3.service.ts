import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestCreateS3UploadKeyDto } from './dtos/request/request-create-s3-upload-key.dto';
import { randomUUID } from 'crypto';
import { CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand, S3, S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost, PresignedPost } from '@aws-sdk/s3-presigned-post';
import { getKoreanDate } from 'src/utils/dateUtils';
import { S3ImageTmp } from '@prisma/client';
export enum S3ImageTmpTableName {
    WORKSPACE = 'workspace',
    USER = 'user',
    LAST_BAG = 'last_bag',
}
@Injectable()
export class S3Service {
    private readonly IS_DEV: boolean;
    private readonly allowFormats: string[] = ['image/webp'];
    private readonly s3: S3Client;
    private readonly MAX_BYTE_SIZE: number;
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.IS_DEV = this.configService.get('NODE_ENV') === 'develop';
        this.s3 = new S3Client();
        this.MAX_BYTE_SIZE = 1024 * 1024 * this.configService.get<number>("S3_MAX_BYTE_SIZE")!;
    }

    async createS3UploadKey(dto: RequestCreateS3UploadKeyDto, userId: bigint) {
        const { byteSize, format, originalName } = dto;
        if (!this.allowFormats.includes(format)) throw new BadRequestException('지원하지 않는 이미지 포멧입니다.');
        if (byteSize > this.MAX_BYTE_SIZE) throw new BadRequestException('이미지 용량이 너무 큽니다. (최대 5MB)');
        const extension = format.split('/')[1] || 'bin';
        const path = `tmp/${randomUUID()}.${extension}`;
        const bucket = this.configService.get<string>("AWS_S3_BUCKET_NAME")!;

        const presigned: PresignedPost = await createPresignedPost(this.s3, {
            Bucket: bucket,
            Key: path,
            Expires: 900,
            Conditions: [
                ['content-length-range', 1, byteSize],
                ['eq', '$Content-Type', format],
            ],
            Fields: {
                'Content-Type': format,
            },
        });

        const s3data = await this.prisma.s3ImageTmp.create({
            data: {
                originalName,
                userId,
                path,
                format,
                byteSize,
                createDate: getKoreanDate(),
                isConfirmed: false,
            },
        }).catch((error) => {
            console.error(error);
            throw new InternalServerErrorException('데이터베이스 저장 실패');
        });
        return { ...presigned, id: s3data.id };
    }

    async confirmS3ImageTmp(userId: bigint, s3ImageTmpIds: bigint[], tableName: string) {
        const rows = await this.prisma.s3ImageTmp.findMany({
            where: {
                id: { in: s3ImageTmpIds },
                userId,
                isConfirmed: false
            },
            select: {
                id: true,
                path: true,
                byteSize: true,
                format: true,
                isConfirmed: false,
                originalName: true,
            },
        });

        if (rows.length === 0) {
            throw new BadRequestException('대상 이미지가 없습니다.');
        }

        const confirm = async (row: S3ImageTmp) => {
            try {
                const head = await this.s3.send(
                    new HeadObjectCommand({
                        Bucket: this.configService.get<string>("AWS_S3_BUCKET_NAME")!,
                        Key: row.path,
                    })
                );
                if (head.ContentLength !== row.byteSize) {
                    return { row, ok: false as const, reason: "SIZE_MISMATCH" };
                }
    
                if (head.ContentType && head.ContentType !== row.format) {
                    return { row, ok: false as const, reason: "MIME_MISMATCH" };
                }
            } catch (error) {
                console.error(error);
                return { row, ok: false as const, reason: "이미지 검증 실패" };
            }
            try {

                const newPath = `${tableName}/${row.path.replace(/^tmp\//, '')}`;

                await this.s3.send(
                    new CopyObjectCommand({
                        Bucket: this.configService.get<string>("AWS_S3_BUCKET_NAME")!,
                        CopySource: `${this.configService.get<string>("AWS_S3_BUCKET_NAME")!}/${row.path}`,
                        Key: newPath,
                    })
                );

                await this.s3.send(
                    new DeleteObjectCommand({
                        Bucket: this.configService.get<string>("AWS_S3_BUCKET_NAME")!,
                        Key: row.path,
                    })
                );

                return { row: { ...row, path: newPath }, ok: true as const };
            } catch (error) {
                console.error(error);
                return { row, ok: false as const, reason: "이미지 이동 실패" };
            }
        };

        const results = await this.mapLimit(rows, 5, confirm);
        const success = results.filter(r => r.ok).map(r => r.row);
        const failed = results.filter(r => !r.ok);
        
        return { success, failed };
    }

    private async mapLimit<T, R>(
        items: T[],
        limit: number,
        fn: (item: T, index: number) => Promise<R>
    ): Promise<R[]> {
        const results: R[] = new Array(items.length) as R[];
        let idx = 0;
        const workers = Array(Math.min(limit, items.length))
            .fill(0)
            .map(async () => {
                while (true) {
                    const current = idx++;
                    if (current >= items.length) break;
                    results[current] = await fn(items[current], current);
                }
            });
        await Promise.all(workers);
        return results;
    }
}