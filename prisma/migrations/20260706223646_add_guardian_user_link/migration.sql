-- AlterTable
ALTER TABLE "guardians" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
