/*
  Warnings:

  - You are about to drop the column `last_logout_date` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "last_logout_date";
