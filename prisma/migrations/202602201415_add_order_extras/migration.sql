-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isExtra" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "parentId" TEXT;