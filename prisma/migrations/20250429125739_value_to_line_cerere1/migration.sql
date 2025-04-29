/*
  Warnings:

  - Added the required column `valoare` to the `LinieCerereAprovizionare` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LinieCerereAprovizionare" ADD COLUMN     "valoare" DECIMAL(65,30) NOT NULL;
