-- CreateTable
CREATE TABLE "OrderItemUnit" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "unitIndex" INTEGER NOT NULL,

    CONSTRAINT "OrderItemUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderItemUnit_orderItemId_idx" ON "OrderItemUnit"("orderItemId");

-- AddForeignKey
ALTER TABLE "OrderItemUnit" ADD CONSTRAINT "OrderItemUnit_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;