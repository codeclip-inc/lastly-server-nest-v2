-- CreateEnum
CREATE TYPE "public"."ApproveStatus" AS ENUM ('PENDING', 'APPROVE', 'DENY');

-- CreateEnum
CREATE TYPE "public"."PayStatus" AS ENUM ('REQUESTED', 'APPROVED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."ReservationStatus" AS ENUM ('PENDING', 'REQUESTED', 'APPROVED', 'REJECTED', 'PICKEDUP', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('KAKAO', 'TOSS', 'TOSS_PAYMENTS', 'NICEPAY');

-- CreateEnum
CREATE TYPE "public"."RefundInitiator" AS ENUM ('OWNER', 'USER');

-- CreateEnum
CREATE TYPE "public"."LoginProvider" AS ENUM ('KAKAO', 'APPLE', 'GOOGLE');

-- CreateTable
CREATE TABLE "public"."s3_upload_histories" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "key" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "s3_upload_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "provider" "public"."LoginProvider",
    "provider_id" TEXT,
    "refresh_token" TEXT,
    "image_path" TEXT,
    "create_date" TIMESTAMP(3) NOT NULL,
    "delete_date" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workspace_categories" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "workspace_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workspaces" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT,
    "name" TEXT NOT NULL,
    "owner_user_id" BIGINT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "business_registration_num" VARCHAR(12) NOT NULL,
    "approve_status" "public"."ApproveStatus" NOT NULL DEFAULT 'APPROVE',
    "create_date" TIMESTAMP(3) NOT NULL,
    "delete_date" TIMESTAMP(3),

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workspace_images" (
    "id" BIGSERIAL NOT NULL,
    "workspace_id" BIGINT NOT NULL,
    "original_name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_templates" (
    "id" BIGSERIAL NOT NULL,
    "workspace_id" BIGINT NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "original_price" INTEGER NOT NULL,
    "sale_price" INTEGER NOT NULL,
    "delete_date" TIMESTAMP(3),

    CONSTRAINT "product_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_template_images" (
    "id" BIGSERIAL NOT NULL,
    "template_id" BIGINT NOT NULL,
    "original_name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_template_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" BIGSERIAL NOT NULL,
    "workspace_id" BIGINT NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "original_price" INTEGER NOT NULL,
    "sale_price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sale_date" DATE NOT NULL,
    "ref_template_id" BIGINT NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."carts" (
    "id" BIGSERIAL NOT NULL,
    "workspace_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cart_items" (
    "id" BIGSERIAL NOT NULL,
    "cart_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_reservations" (
    "id" BIGSERIAL NOT NULL,
    "workspace_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,
    "verify_code" TEXT NOT NULL,
    "payment_id" BIGINT NOT NULL,
    "status" "public"."ReservationStatus" NOT NULL,

    CONSTRAINT "product_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reservation_products" (
    "id" BIGSERIAL NOT NULL,
    "reservation_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "reservation_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" BIGSERIAL NOT NULL,
    "payment_key" TEXT,
    "workspace_id" BIGINT NOT NULL,
    "amount" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "cancled_at" TIMESTAMP(3),
    "status" "public"."PayStatus" NOT NULL DEFAULT 'REQUESTED',
    "paymentType" "public"."PaymentType" NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refunds" (
    "id" BIGSERIAL NOT NULL,
    "paymentId" BIGINT NOT NULL,
    "reason" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "initiator" "public"."RefundInitiator" NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookmarks" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "workspaceId" BIGINT NOT NULL,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."last_bag_templates" (
    "id" BIGSERIAL NOT NULL,
    "workspaceId" BIGINT NOT NULL,
    "description" TEXT NOT NULL,
    "originalPrice" INTEGER NOT NULL,
    "salePrice" INTEGER NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIME(0) NOT NULL,
    "quantity" INTEGER,

    CONSTRAINT "last_bag_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."last_bags" (
    "id" BIGSERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "workspaceId" BIGINT NOT NULL,
    "originalPrice" INTEGER NOT NULL,
    "salePrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIME(0) NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "last_bags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."last_bag_reservations" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "workspaceId" BIGINT NOT NULL,
    "lastBagId" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createDate" DATE NOT NULL,
    "cancelDateTime" TIMESTAMP(3),
    "paymentId" BIGINT NOT NULL,
    "verifyCode" TEXT NOT NULL,
    "status" "public"."ReservationStatus" NOT NULL,

    CONSTRAINT "last_bag_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "s3_upload_histories_key_key" ON "public"."s3_upload_histories"("key");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_key" ON "public"."cart_items"("cart_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_reservations_payment_id_key" ON "public"."product_reservations"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_key_key" ON "public"."payments"("payment_key");

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderId_key" ON "public"."payments"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_paymentId_key" ON "public"."refunds"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "last_bag_templates_workspaceId_key" ON "public"."last_bag_templates"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "last_bags_workspaceId_date_key" ON "public"."last_bags"("workspaceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "last_bag_reservations_paymentId_key" ON "public"."last_bag_reservations"("paymentId");

-- AddForeignKey
ALTER TABLE "public"."s3_upload_histories" ADD CONSTRAINT "s3_upload_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workspaces" ADD CONSTRAINT "workspaces_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workspaces" ADD CONSTRAINT "workspaces_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."workspace_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workspace_images" ADD CONSTRAINT "workspace_images_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_templates" ADD CONSTRAINT "product_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_template_images" ADD CONSTRAINT "product_template_images_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."product_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_ref_template_id_fkey" FOREIGN KEY ("ref_template_id") REFERENCES "public"."product_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carts" ADD CONSTRAINT "carts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_reservations" ADD CONSTRAINT "product_reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_reservations" ADD CONSTRAINT "product_reservations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_reservations" ADD CONSTRAINT "product_reservations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservation_products" ADD CONSTRAINT "reservation_products_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."product_reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservation_products" ADD CONSTRAINT "reservation_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."last_bag_templates" ADD CONSTRAINT "last_bag_templates_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."last_bags" ADD CONSTRAINT "last_bags_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."last_bag_reservations" ADD CONSTRAINT "last_bag_reservations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."last_bag_reservations" ADD CONSTRAINT "last_bag_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."last_bag_reservations" ADD CONSTRAINT "last_bag_reservations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."last_bag_reservations" ADD CONSTRAINT "last_bag_reservations_lastBagId_fkey" FOREIGN KEY ("lastBagId") REFERENCES "public"."last_bags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
