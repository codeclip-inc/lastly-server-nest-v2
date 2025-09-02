/*
  Warnings:

  - You are about to drop the `AuthHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `s3_upload_histories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."s3_upload_histories" DROP CONSTRAINT "s3_upload_histories_user_id_fkey";

-- DropTable
DROP TABLE "public"."AuthHistory";

-- DropTable
DROP TABLE "public"."s3_upload_histories";

-- CreateTable
CREATE TABLE "public"."s3_images" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "path" TEXT NOT NULL,
    "confirmed_code" TEXT,
    "byte_size" INTEGER NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "s3_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auth_histories" (
    "id" BIGSERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."s3_images" ADD CONSTRAINT "s3_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
