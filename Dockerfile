# 빌드 스테이지
FROM node:20 AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn prisma generate
RUN yarn build

# 실행 스테이지
FROM node:20-slim AS production

WORKDIR /app
RUN apt-get update && apt-get install -y openssl

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile && yarn cache clean

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 엔트리포인트 복사 및 실행 권한 부여
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000

# 서버 시작 전 마이그레이션 실행
ENTRYPOINT ["./entrypoint.sh"]