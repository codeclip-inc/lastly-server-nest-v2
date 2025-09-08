/*
  Warnings:

  - Added the required column `owner_name` to the `workspaces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."workspaces" ADD COLUMN     "owner_name" TEXT NOT NULL;
