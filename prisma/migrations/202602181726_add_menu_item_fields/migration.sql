-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;