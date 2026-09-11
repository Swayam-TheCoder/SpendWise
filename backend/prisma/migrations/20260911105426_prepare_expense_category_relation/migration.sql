-- DropIndex
DROP INDEX "Expense_userId_category_idx";

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "Expense_userId_categoryId_idx" ON "Expense"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
