PRAGMA foreign_keys=OFF;

CREATE TABLE "pessoas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL
);

CREATE UNIQUE INDEX "pessoas_nome_key" ON "pessoas"("nome");

INSERT INTO "pessoas" ("nome", "ativa")
VALUES ("Marcus", 1), ("Maju", 1);

CREATE TABLE "new_lancamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor" DECIMAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "pessoa_id" INTEGER NOT NULL,
    "eh_casa" BOOLEAN NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "subconta_id" INTEGER NOT NULL,
    "descricao" TEXT,
    CONSTRAINT "lancamentos_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_subconta_id_fkey" FOREIGN KEY ("subconta_id") REFERENCES "subcontas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_lancamentos" (
    "id",
    "data",
    "mes",
    "ano",
    "valor",
    "tipo",
    "pessoa_id",
    "eh_casa",
    "categoria_id",
    "subconta_id",
    "descricao"
)
SELECT
    "id",
    "data",
    CAST(strftime('%m', "data") AS INTEGER),
    CAST(strftime('%Y', "data") AS INTEGER),
    "valor",
    "tipo",
    (SELECT "id" FROM "pessoas" WHERE "nome" = 'Marcus' LIMIT 1),
    0,
    "categoria_id",
    "subconta_id",
    "descricao"
FROM "lancamentos";

DROP TABLE "lancamentos";
ALTER TABLE "new_lancamentos" RENAME TO "lancamentos";

CREATE INDEX "lancamentos_pessoa_id_idx" ON "lancamentos"("pessoa_id");
CREATE INDEX "lancamentos_categoria_id_idx" ON "lancamentos"("categoria_id");
CREATE INDEX "lancamentos_subconta_id_idx" ON "lancamentos"("subconta_id");
CREATE INDEX "lancamentos_ano_mes_idx" ON "lancamentos"("ano", "mes");

CREATE TABLE "new_transferencias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor" DECIMAL NOT NULL,
    "subconta_origem_id" INTEGER NOT NULL,
    "subconta_destino_id" INTEGER NOT NULL,
    "descricao" TEXT,
    CONSTRAINT "transferencias_subconta_origem_id_fkey" FOREIGN KEY ("subconta_origem_id") REFERENCES "subcontas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transferencias_subconta_destino_id_fkey" FOREIGN KEY ("subconta_destino_id") REFERENCES "subcontas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_transferencias" (
    "id",
    "data",
    "mes",
    "ano",
    "valor",
    "subconta_origem_id",
    "subconta_destino_id",
    "descricao"
)
SELECT
    "id",
    "data",
    CAST(strftime('%m', "data") AS INTEGER),
    CAST(strftime('%Y', "data") AS INTEGER),
    "valor",
    "subconta_origem_id",
    "subconta_destino_id",
    "descricao"
FROM "transferencias";

DROP TABLE "transferencias";
ALTER TABLE "new_transferencias" RENAME TO "transferencias";

CREATE INDEX "transferencias_subconta_origem_id_idx" ON "transferencias"("subconta_origem_id");
CREATE INDEX "transferencias_subconta_destino_id_idx" ON "transferencias"("subconta_destino_id");
CREATE INDEX "transferencias_ano_mes_idx" ON "transferencias"("ano", "mes");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
