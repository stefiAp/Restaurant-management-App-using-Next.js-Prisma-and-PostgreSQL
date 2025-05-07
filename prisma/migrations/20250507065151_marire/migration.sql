-- CreateEnum
CREATE TYPE "StatusLinieReceptie" AS ENUM ('receptionata', 'partiala', 'respinsa');

-- CreateEnum
CREATE TYPE "StatusLivrare" AS ENUM ('În așteptare', 'În curs de livrare', 'Livrată', 'Anulată', 'Neconfirmată');

-- AlterEnum
ALTER TYPE "StatusCerere" ADD VALUE 'finalizată';

-- CreateTable
CREATE TABLE "Receptie" (
    "id_receptie" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valoare_totala" DECIMAL(65,30) NOT NULL DEFAULT 0.0,

    CONSTRAINT "Receptie_pkey" PRIMARY KEY ("id_receptie")
);

-- CreateTable
CREATE TABLE "Linie_receptie" (
    "id_linie_receptie" SERIAL NOT NULL,
    "id_bun" INTEGER NOT NULL,
    "id_receptie" INTEGER NOT NULL,
    "cantitate_receptionata" DECIMAL(65,30) NOT NULL,
    "pret" DECIMAL(65,30) NOT NULL,
    "status" "StatusLinieReceptie" NOT NULL DEFAULT 'receptionata',
    "validat" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Linie_receptie_pkey" PRIMARY KEY ("id_linie_receptie")
);

-- CreateTable
CREATE TABLE "Comanda" (
    "id_comanda" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "valoare" DECIMAL(65,30) NOT NULL,
    "id_client" INTEGER NOT NULL,

    CONSTRAINT "Comanda_pkey" PRIMARY KEY ("id_comanda")
);

-- CreateTable
CREATE TABLE "Client" (
    "id_client" SERIAL NOT NULL,
    "nume" TEXT NOT NULL,
    "adresa" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "Linie_comanda" (
    "id_linie_comanda" SERIAL NOT NULL,
    "id_comanda" INTEGER NOT NULL,
    "id_produs" INTEGER NOT NULL,
    "cantitate" INTEGER NOT NULL,
    "valoare" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Linie_comanda_pkey" PRIMARY KEY ("id_linie_comanda")
);

-- CreateTable
CREATE TABLE "Produs" (
    "id_produs" SERIAL NOT NULL,
    "pret" DECIMAL(65,30) NOT NULL,
    "cantitate" DECIMAL(65,30) NOT NULL,
    "um" TEXT NOT NULL,
    "denumire" TEXT NOT NULL,
    "id_reteta" INTEGER,

    CONSTRAINT "Produs_pkey" PRIMARY KEY ("id_produs")
);

-- CreateTable
CREATE TABLE "Masa" (
    "id_masa" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "nrMasa" INTEGER NOT NULL,

    CONSTRAINT "Masa_pkey" PRIMARY KEY ("id_masa")
);

-- CreateTable
CREATE TABLE "Comenzi_onsite" (
    "id_comanda" INTEGER NOT NULL,
    "id_masa" INTEGER NOT NULL,

    CONSTRAINT "Comenzi_onsite_pkey" PRIMARY KEY ("id_comanda")
);

-- CreateTable
CREATE TABLE "Comenzi_online" (
    "id_comanda" INTEGER NOT NULL,
    "adresa_livrare" TEXT NOT NULL,

    CONSTRAINT "Comenzi_online_pkey" PRIMARY KEY ("id_comanda")
);

-- CreateTable
CREATE TABLE "Livrare" (
    "id_livrare" SERIAL NOT NULL,
    "id_comanda" INTEGER NOT NULL,
    "adresa_livrare" TEXT NOT NULL,
    "id_angajat" INTEGER NOT NULL,
    "data_livrare" TIMESTAMP(3) NOT NULL,
    "status_livrare" "StatusLivrare" NOT NULL,

    CONSTRAINT "Livrare_pkey" PRIMARY KEY ("id_livrare")
);

-- AddForeignKey
ALTER TABLE "Linie_receptie" ADD CONSTRAINT "Linie_receptie_id_bun_fkey" FOREIGN KEY ("id_bun") REFERENCES "Bun"("id_bun") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Linie_receptie" ADD CONSTRAINT "Linie_receptie_id_receptie_fkey" FOREIGN KEY ("id_receptie") REFERENCES "Receptie"("id_receptie") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Linie_comanda" ADD CONSTRAINT "Linie_comanda_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Linie_comanda" ADD CONSTRAINT "Linie_comanda_id_produs_fkey" FOREIGN KEY ("id_produs") REFERENCES "Produs"("id_produs") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comenzi_onsite" ADD CONSTRAINT "Comenzi_onsite_id_masa_fkey" FOREIGN KEY ("id_masa") REFERENCES "Masa"("id_masa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comenzi_onsite" ADD CONSTRAINT "Comenzi_onsite_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comenzi_online" ADD CONSTRAINT "Comenzi_online_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livrare" ADD CONSTRAINT "Livrare_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livrare" ADD CONSTRAINT "Livrare_id_angajat_fkey" FOREIGN KEY ("id_angajat") REFERENCES "Angajati"("id_angajat") ON DELETE RESTRICT ON UPDATE CASCADE;
