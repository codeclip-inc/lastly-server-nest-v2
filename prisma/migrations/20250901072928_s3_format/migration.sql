/*
  Warnings:

  - Added the required column `format` to the `s3_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."s3_images" ADD COLUMN     "format" TEXT NOT NULL;
