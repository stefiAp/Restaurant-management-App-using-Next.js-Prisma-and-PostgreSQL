/*
  Warnings:

  - The primary key for the `CerereAprovizionare` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id_cerere` column on the `CerereAprovizionare` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Consum` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id_consum` column on the `Consum` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Document` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[nr_document]` on the table `CerereAprovizionare` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nr_document]` on the table `Consum` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nr_document` to the `CerereAprovizionare` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nr_document` to the `Consum` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `nr_document` on the `Document` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_cerere` on the `LinieCerereAprovizionare` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_consum` on the `LinieConsum` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "CerereAprovizionare" DROP CONSTRAINT "CerereAprovizionare_id_cerere_fkey";

-- DropForeignKey
ALTER TABLE "Consum" DROP CONSTRAINT "Consum_id_consum_fkey";

-- DropForeignKey
ALTER TABLE "LinieCerereAprovizionare" DROP CONSTRAINT "LinieCerereAprovizionare_id_cerere_fkey";

-- DropForeignKey
ALTER TABLE "LinieConsum" DROP CONSTRAINT "LinieConsum_id_consum_fkey";

-- AlterTable
CREATE SEQUENCE angajati_id_angajat_seq;
ALTER TABLE "Angajati" ALTER COLUMN "id_angajat" SET DEFAULT nextval('angajati_id_angajat_seq');
ALTER SEQUENCE angajati_id_angajat_seq OWNED BY "Angajati"."id_angajat";

-- AlterTable
CREATE SEQUENCE bun_id_bun_seq;
ALTER TABLE "Bun" ALTER COLUMN "id_bun" SET DEFAULT nextval('bun_id_bun_seq');
ALTER SEQUENCE bun_id_bun_seq OWNED BY "Bun"."id_bun";

-- AlterTable
ALTER TABLE "CerereAprovizionare" DROP CONSTRAINT "CerereAprovizionare_pkey",
ADD COLUMN     "nr_document" TEXT NOT NULL,
DROP COLUMN "id_cerere",
ADD COLUMN     "id_cerere" SERIAL NOT NULL,
ADD CONSTRAINT "CerereAprovizionare_pkey" PRIMARY KEY ("id_cerere");

-- AlterTable
ALTER TABLE "Consum" DROP CONSTRAINT "Consum_pkey",
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nr_document" INTEGER NOT NULL,
DROP COLUMN "id_consum",
ADD COLUMN     "id_consum" SERIAL NOT NULL,
ADD CONSTRAINT "Consum_pkey" PRIMARY KEY ("id_consum");

-- AlterTable
ALTER TABLE "Document" DROP CONSTRAINT "Document_pkey",
DROP COLUMN "nr_document",
ADD COLUMN     "nr_document" INTEGER NOT NULL,
ADD CONSTRAINT "Document_pkey" PRIMARY KEY ("nr_document");

-- AlterTable
CREATE SEQUENCE gestiune_id_gestiune_seq;
ALTER TABLE "Gestiune" ALTER COLUMN "id_gestiune" SET DEFAULT nextval('gestiune_id_gestiune_seq');
ALTER SEQUENCE gestiune_id_gestiune_seq OWNED BY "Gestiune"."id_gestiune";

-- AlterTable
CREATE SEQUENCE liniecerereaprovizionare_id_seq;
ALTER TABLE "LinieCerereAprovizionare" ALTER COLUMN "id" SET DEFAULT nextval('liniecerereaprovizionare_id_seq'),
DROP COLUMN "id_cerere",
ADD COLUMN     "id_cerere" INTEGER NOT NULL;
ALTER SEQUENCE liniecerereaprovizionare_id_seq OWNED BY "LinieCerereAprovizionare"."id";

-- AlterTable
ALTER TABLE "LinieConsum" DROP COLUMN "id_consum",
ADD COLUMN     "id_consum" INTEGER NOT NULL;

-- AlterTable
CREATE SEQUENCE stoc_id_stoc_seq;
ALTER TABLE "Stoc" ALTER COLUMN "id_stoc" SET DEFAULT nextval('stoc_id_stoc_seq');
ALTER SEQUENCE stoc_id_stoc_seq OWNED BY "Stoc"."id_stoc";

-- CreateIndex
CREATE UNIQUE INDEX "CerereAprovizionare_nr_document_key" ON "CerereAprovizionare"("nr_document");

-- CreateIndex
CREATE UNIQUE INDEX "Consum_nr_document_key" ON "Consum"("nr_document");

-- AddForeignKey
ALTER TABLE "Consum" ADD CONSTRAINT "Consum_id_consum_fkey" FOREIGN KEY ("id_consum") REFERENCES "Document"("nr_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CerereAprovizionare" ADD CONSTRAINT "CerereAprovizionare_id_cerere_fkey" FOREIGN KEY ("id_cerere") REFERENCES "Document"("nr_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinieConsum" ADD CONSTRAINT "LinieConsum_id_consum_fkey" FOREIGN KEY ("id_consum") REFERENCES "Consum"("id_consum") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinieCerereAprovizionare" ADD CONSTRAINT "LinieCerereAprovizionare_id_cerere_fkey" FOREIGN KEY ("id_cerere") REFERENCES "CerereAprovizionare"("id_cerere") ON DELETE RESTRICT ON UPDATE CASCADE;
