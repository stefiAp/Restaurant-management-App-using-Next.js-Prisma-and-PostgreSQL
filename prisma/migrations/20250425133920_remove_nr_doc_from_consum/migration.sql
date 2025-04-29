/*
  Warnings:

  - You are about to drop the column `nr_document` on the `CerereAprovizionare` table. All the data in the column will be lost.
  - You are about to drop the column `nr_document` on the `Consum` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CerereAprovizionare_nr_document_key";

-- DropIndex
DROP INDEX "Consum_nr_document_key";

-- AlterTable
ALTER TABLE "CerereAprovizionare" DROP COLUMN "nr_document";

-- AlterTable
ALTER TABLE "Consum" DROP COLUMN "nr_document";
