/*
  Warnings:

  - Added the required column `valoare` to the `CerereAprovizionare` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CerereAprovizionare" ADD COLUMN     "valoare" DECIMAL(65,30) NOT NULL;
