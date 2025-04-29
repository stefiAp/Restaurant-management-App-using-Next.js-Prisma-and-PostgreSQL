-- AlterTable
ALTER TABLE "CerereAprovizionare" ALTER COLUMN "id_cerere" DROP DEFAULT;
DROP SEQUENCE "CerereAprovizionare_id_cerere_seq";

-- AlterTable
ALTER TABLE "Consum" ALTER COLUMN "id_consum" DROP DEFAULT;
DROP SEQUENCE "Consum_id_consum_seq";

-- AlterTable
CREATE SEQUENCE document_nr_document_seq;
ALTER TABLE "Document" ALTER COLUMN "nr_document" SET DEFAULT nextval('document_nr_document_seq');
ALTER SEQUENCE document_nr_document_seq OWNED BY "Document"."nr_document";
