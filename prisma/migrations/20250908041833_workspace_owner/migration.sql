/*
  Warnings:

  - You are about to drop the `cart_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `carts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_reservations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_template_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reservation_products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `s3_images_tmp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."cart_items" DROP CONSTRAINT "cart_items_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cart_items" DROP CONSTRAINT "cart_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."carts" DROP CONSTRAINT "carts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."carts" DROP CONSTRAINT "carts_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_reservations" DROP CONSTRAINT "product_reservations_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_reservations" DROP CONSTRAINT "product_reservations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_reservations" DROP CONSTRAINT "product_reservations_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_template_images" DROP CONSTRAINT "product_template_images_template_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_templates" DROP CONSTRAINT "product_templates_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."products" DROP CONSTRAINT "products_ref_template_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."products" DROP CONSTRAINT "products_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reservation_products" DROP CONSTRAINT "reservation_products_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reservation_products" DROP CONSTRAINT "reservation_products_reservation_id_fkey";

-- DropTable
DROP TABLE "public"."cart_items";

-- DropTable
DROP TABLE "public"."carts";

-- DropTable
DROP TABLE "public"."product_reservations";

-- DropTable
DROP TABLE "public"."product_template_images";

-- DropTable
DROP TABLE "public"."product_templates";

-- DropTable
DROP TABLE "public"."products";

-- DropTable
DROP TABLE "public"."reservation_products";

-- DropTable
DROP TABLE "public"."s3_images_tmp";

-- CreateTable
CREATE TABLE "public"."s3_image_tmps" (
    "id" BIGSERIAL NOT NULL,
    "format" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "path" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "original_name" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "s3_image_tmps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."s3_image_tmps" ADD CONSTRAINT "s3_image_tmps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
