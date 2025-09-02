/*
  Warnings:

  - You are about to drop the column `confirmed_code` on the `s3_images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."s3_images" DROP COLUMN "confirmed_code";
