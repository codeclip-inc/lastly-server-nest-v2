#!/bin/sh

# Prisma 마이그레이션
npx prisma migrate deploy

# NestJS 서버 실행
exec node dist/main
