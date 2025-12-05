-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ETHICS', 'TECHNOLOGY', 'PERSONAL', 'WORK', 'POLITICS', 'LIFESTYLE', 'OTHER');

-- AlterTable
ALTER TABLE "Dilemma" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'OTHER';
