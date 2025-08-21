-- CreateTable
CREATE TABLE "public"."AuthHistory" (
    "id" BIGSERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthHistory_pkey" PRIMARY KEY ("id")
);
