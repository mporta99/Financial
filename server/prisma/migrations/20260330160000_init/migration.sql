-- CreateEnum
CREATE TYPE "TipoSubconta" AS ENUM ('livre', 'restrita', 'investimento');

-- CreateEnum
CREATE TYPE "TipoCategoria" AS ENUM ('entrada', 'saida');

-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('entrada', 'saida');

-- CreateTable
CREATE TABLE "carteiras" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL,

    CONSTRAINT "carteiras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcontas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoSubconta" NOT NULL,
    "carteira_id" INTEGER NOT NULL,
    "ativa" BOOLEAN NOT NULL,

    CONSTRAINT "subcontas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoCategoria" NOT NULL,
    "grupo" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "tipo" "TipoLancamento" NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "subconta_id" INTEGER NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferencias" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "subconta_origem_id" INTEGER NOT NULL,
    "subconta_destino_id" INTEGER NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "transferencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_subcontas" (
    "id" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "subconta_id" INTEGER NOT NULL,

    CONSTRAINT "categorias_subcontas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subcontas_carteira_id_nome_key" ON "subcontas"("carteira_id", "nome");

-- CreateIndex
CREATE INDEX "subcontas_carteira_id_idx" ON "subcontas"("carteira_id");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_tipo_nome_key" ON "categorias"("tipo", "nome");

-- CreateIndex
CREATE INDEX "lancamentos_categoria_id_idx" ON "lancamentos"("categoria_id");

-- CreateIndex
CREATE INDEX "lancamentos_subconta_id_idx" ON "lancamentos"("subconta_id");

-- CreateIndex
CREATE INDEX "transferencias_subconta_origem_id_idx" ON "transferencias"("subconta_origem_id");

-- CreateIndex
CREATE INDEX "transferencias_subconta_destino_id_idx" ON "transferencias"("subconta_destino_id");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_subcontas_categoria_id_subconta_id_key" ON "categorias_subcontas"("categoria_id", "subconta_id");

-- CreateIndex
CREATE INDEX "categorias_subcontas_categoria_id_idx" ON "categorias_subcontas"("categoria_id");

-- CreateIndex
CREATE INDEX "categorias_subcontas_subconta_id_idx" ON "categorias_subcontas"("subconta_id");

-- AddForeignKey
ALTER TABLE "subcontas" ADD CONSTRAINT "subcontas_carteira_id_fkey" FOREIGN KEY ("carteira_id") REFERENCES "carteiras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_subconta_id_fkey" FOREIGN KEY ("subconta_id") REFERENCES "subcontas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_subconta_origem_id_fkey" FOREIGN KEY ("subconta_origem_id") REFERENCES "subcontas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_subconta_destino_id_fkey" FOREIGN KEY ("subconta_destino_id") REFERENCES "subcontas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_subcontas" ADD CONSTRAINT "categorias_subcontas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_subcontas" ADD CONSTRAINT "categorias_subcontas_subconta_id_fkey" FOREIGN KEY ("subconta_id") REFERENCES "subcontas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
