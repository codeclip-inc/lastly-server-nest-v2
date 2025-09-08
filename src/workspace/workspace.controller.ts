import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateWorkspaceRequestDto } from './dtos/request/create-workspace-request.dto';
import { JwtPayload } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DetailWorkspaceResponseDto } from './dtos/response/detail-workspace-response.dto';

@Controller('workspaces')
export class WorkspaceController {
    constructor(
        private readonly workspaceService: WorkspaceService
    ) {}

    @Post("")
    @ApiOperation({ summary: '워크스페이스 생성', description: '새로운 점포 생성' })
    @ApiBody({ type: CreateWorkspaceRequestDto })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth("Authorization")
    @ApiResponse({ status: 204, description: '워크스페이스 생성 성공' })
    @ApiResponse({ status: 400, description: '워크스페이스 생성 실패' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async createWorkspace(
        @Req() req: Request & { user: JwtPayload },
        @Body() dto: CreateWorkspaceRequestDto
    ) {
        await this.workspaceService.createWorkspace(dto, BigInt(req.user.sub));  
    }

    @Get(":id")
    @ApiOperation({ summary: '워크스페이스 상세 조회', description: '워크스페이스 상세 조회' })
    @ApiParam({ name: 'id', description: '워크스페이스 ID' })
    @ApiResponse({ status: 200, description: '워크스페이스 상세 조회 성공', type: DetailWorkspaceResponseDto })
    @ApiResponse({ status: 400, description: '워크스페이스 상세 조회 실패' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async getWorkspace(@Param('id') id: string) {
        return this.workspaceService.getWorkspace(BigInt(id));
    }   
}
