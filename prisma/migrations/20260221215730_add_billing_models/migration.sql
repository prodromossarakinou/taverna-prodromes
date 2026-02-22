-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "waiterName" TEXT,
    "baseOrderIds" TEXT[],
    "extraOrderIds" TEXT[],
    "subtotalBase" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotalExtras" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillItem" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT,
    "isExtra" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillItem_billId_idx" ON "BillItem"("billId");

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
