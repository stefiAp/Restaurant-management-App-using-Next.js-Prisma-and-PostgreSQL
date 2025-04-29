/*
  Warnings:

  - The primary key for the `LinieConsum` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id_linie_consum` column on the `LinieConsum` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "LinieConsum" DROP CONSTRAINT "LinieConsum_pkey",
DROP COLUMN "id_linie_consum",
ADD COLUMN     "id_linie_consum" SERIAL NOT NULL,
ADD CONSTRAINT "LinieConsum_pkey" PRIMARY KEY ("id_linie_consum");
