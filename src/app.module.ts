import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from './s3/s3.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtGlobalModule } from './auth/jwt-global.module';
import { WorkspaceModule } from './workspace/workspace.module';
@Global()
@Module({
  imports: [AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    S3Module,
    PrismaModule,
    JwtGlobalModule,
    WorkspaceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
