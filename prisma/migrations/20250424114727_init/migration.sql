-- CreateEnum
CREATE TYPE "StatusCerere" AS ENUM ('în așteptare', 'aprobată', 'respinsă');

-- CreateTable
CREATE TABLE "Document" (
    "nr_document" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("nr_document")
);

-- CreateTable
CREATE TABLE "Angajati" (
    "id_angajat" INTEGER NOT NULL,
    "nume_angajat" TEXT NOT NULL,
    "prenume_angajat" TEXT NOT NULL,
    "functie" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "data_angajare" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Angajati_pkey" PRIMARY KEY ("id_angajat")
);

-- CreateTable
CREATE TABLE "Stoc" (
    "id_stoc" INTEGER NOT NULL,
    "id_bun" INTEGER NOT NULL,
    "id_gestiune" INTEGER NOT NULL,
    "stoc_init_lunar" DECIMAL(65,30),
    "stoc_actual" DECIMAL(65,30),
    "prag_minim" DECIMAL(65,30),
    "cantitate_optima" DECIMAL(65,30),

    CONSTRAINT "Stoc_pkey" PRIMARY KEY ("id_stoc")
);

-- CreateTable
CREATE TABLE "Gestiune" (
    "id_gestiune" INTEGER NOT NULL,
    "denumire" TEXT,
    "id_gestionar" INTEGER,
    "angajat" TEXT,

    CONSTRAINT "Gestiune_pkey" PRIMARY KEY ("id_gestiune")
);

-- CreateTable
CREATE TABLE "Bun" (
    "id_bun" INTEGER NOT NULL,
    "nume_bun" TEXT NOT NULL,
    "cantitate_disponibila" DECIMAL(65,30) NOT NULL,
    "pret_unitar" DECIMAL(65,30) NOT NULL,
    "data_expirare" TIMESTAMP(3),
    "unitate_masura" TEXT NOT NULL,

    CONSTRAINT "Bun_pkey" PRIMARY KEY ("id_bun")
);

-- CreateTable
CREATE TABLE "Consum" (
    "id_consum" TEXT NOT NULL,
    "valoare" DECIMAL(65,30) NOT NULL,
    "id_sef" INTEGER,
    "id_gestiune" INTEGER NOT NULL,

    CONSTRAINT "Consum_pkey" PRIMARY KEY ("id_consum")
);

-- CreateTable
CREATE TABLE "LinieConsum" (
    "id_linie_consum" TEXT NOT NULL,
    "id_consum" TEXT NOT NULL,
    "id_bun" INTEGER NOT NULL,
    "cantitate_necesara" DECIMAL(65,30) NOT NULL,
    "valoare" DECIMAL(65,30) NOT NULL,
    "cant_eliberata" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "LinieConsum_pkey" PRIMARY KEY ("id_linie_consum")
);

-- CreateTable
CREATE TABLE "CerereAprovizionare" (
    "id_cerere" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_gestiune" INTEGER NOT NULL,
    "status" "StatusCerere" NOT NULL DEFAULT 'în așteptare',

    CONSTRAINT "CerereAprovizionare_pkey" PRIMARY KEY ("id_cerere")
);

-- CreateTable
CREATE TABLE "LinieCerereAprovizionare" (
    "id" INTEGER NOT NULL,
    "id_cerere" TEXT NOT NULL,
    "id_bun" INTEGER NOT NULL,
    "cantitate" DECIMAL(65,30) NOT NULL,
    "observatii" TEXT,

    CONSTRAINT "LinieCerereAprovizionare_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stoc" ADD CONSTRAINT "Stoc_id_gestiune_fkey" FOREIGN KEY ("id_gestiune") REFERENCES "Gestiune"("id_gestiune") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stoc" ADD CONSTRAINT "Stoc_id_bun_fkey" FOREIGN KEY ("id_bun") REFERENCES "Bun"("id_bun") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gestiune" ADD CONSTRAINT "Gestiune_id_gestionar_fkey" FOREIGN KEY ("id_gestionar") REFERENCES "Angajati"("id_angajat") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consum" ADD CONSTRAINT "Consum_id_consum_fkey" FOREIGN KEY ("id_consum") REFERENCES "Document"("nr_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consum" ADD CONSTRAINT "Consum_id_sef_fkey" FOREIGN KEY ("id_sef") REFERENCES "Angajati"("id_angajat") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consum" ADD CONSTRAINT "Consum_id_gestiune_fkey" FOREIGN KEY ("id_gestiune") REFERENCES "Gestiune"("id_gestiune") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinieConsum" ADD CONSTRAINT "LinieConsum_id_consum_fkey" FOREIGN KEY ("id_consum") REFERENCES "Consum"("id_consum") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinieConsum" ADD CONSTRAINT "LinieConsum_id_bun_fkey" FOREIGN KEY ("id_bun") REFERENCES "Bun"("id_bun") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CerereAprovizionare" ADD CONSTRAINT "CerereAprovizionare_id_cerere_fkey" FOREIGN KEY ("id_cerere") REFERENCES "Document"("nr_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CerereAprovizionare" ADD CONSTRAINT "CerereAprovizionare_id_gestiune_fkey" FOREIGN KEY ("id_gestiune") REFERENCES "Gestiune"("id_gestiune") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinieCerereAprovizionare" ADD CONSTRAINT "LinieCerereAprovizionare_id_cerere_fkey" FOREIGN KEY ("id_cerere") REFERENCES "CerereAprovizionare"("id_cerere") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinieCerereAprovizionare" ADD CONSTRAINT "LinieCerereAprovizionare_id_bun_fkey" FOREIGN KEY ("id_bun") REFERENCES "Bun"("id_bun") ON DELETE RESTRICT ON UPDATE CASCADE;
