/*
  Warnings:

  - You are about to drop the `s3_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."s3_images" DROP CONSTRAINT "s3_images_user_id_fkey";

-- DropTable
DROP TABLE "public"."s3_images";

-- CreateTable
CREATE TABLE "public"."s3_images_tmp" (
    "id" BIGSERIAL NOT NULL,
    "format" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "path" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "s3_images_tmp_pkey" PRIMARY KEY ("id")
);
