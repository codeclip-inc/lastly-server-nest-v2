/*
  Warnings:

  - Made the column `provider` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."LoginProvider" ADD VALUE 'PHONE';
ALTER TYPE "public"."LoginProvider" ADD VALUE 'NAVER';

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "provider" SET NOT NULL;
