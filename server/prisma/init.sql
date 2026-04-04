CREATE TABLE "carteiras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL
);

CREATE TABLE "subcontas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "carteira_id" INTEGER NOT NULL,
    "ativa" BOOLEAN NOT NULL,
    CONSTRAINT "subcontas_carteira_id_fkey" FOREIGN KEY ("carteira_id") REFERENCES "carteiras" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL
);

CREATE TABLE "lancamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "valor" DECIMAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "subconta_id" INTEGER NOT NULL,
    "descricao" TEXT,
    CONSTRAINT "lancamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_subconta_id_fkey" FOREIGN KEY ("subconta_id") REFERENCES "subcontas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "transferencias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "valor" DECIMAL NOT NULL,
    "subconta_origem_id" INTEGER NOT NULL,
    "subconta_destino_id" INTEGER NOT NULL,
    "descricao" TEXT,
    CONSTRAINT "transferencias_subconta_origem_id_fkey" FOREIGN KEY ("subconta_origem_id") REFERENCES "subcontas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transferencias_subconta_destino_id_fkey" FOREIGN KEY ("subconta_destino_id") REFERENCES "subcontas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "categorias_subcontas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoria_id" INTEGER NOT NULL,
    "subconta_id" INTEGER NOT NULL,
    CONSTRAINT "categorias_subcontas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "categorias_subcontas_subconta_id_fkey" FOREIGN KEY ("subconta_id") REFERENCES "subcontas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "subcontas_carteira_id_idx" ON "subcontas"("carteira_id");
CREATE UNIQUE INDEX "subcontas_carteira_id_nome_key" ON "subcontas"("carteira_id", "nome");
CREATE UNIQUE INDEX "categorias_tipo_nome_key" ON "categorias"("tipo", "nome");
CREATE INDEX "lancamentos_categoria_id_idx" ON "lancamentos"("categoria_id");
CREATE INDEX "lancamentos_subconta_id_idx" ON "lancamentos"("subconta_id");
CREATE INDEX "transferencias_subconta_origem_id_idx" ON "transferencias"("subconta_origem_id");
CREATE INDEX "transferencias_subconta_destino_id_idx" ON "transferencias"("subconta_destino_id");
CREATE INDEX "categorias_subcontas_categoria_id_idx" ON "categorias_subcontas"("categoria_id");
CREATE INDEX "categorias_subcontas_subconta_id_idx" ON "categorias_subcontas"("subconta_id");
CREATE UNIQUE INDEX "categorias_subcontas_categoria_id_subconta_id_key" ON "categorias_subcontas"("categoria_id", "subconta_id");
