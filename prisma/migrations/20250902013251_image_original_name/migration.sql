/*
  Warnings:

  - Added the required column `original_name` to the `s3_images_tmp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."s3_images_tmp" ADD COLUMN     "original_name" TEXT NOT NULL;
