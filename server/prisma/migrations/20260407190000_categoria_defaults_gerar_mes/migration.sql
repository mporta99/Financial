PRAGMA foreign_keys=OFF;

CREATE TABLE "new_categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL,
    "casa" BOOLEAN NOT NULL DEFAULT false,
    "eh_embutida" BOOLEAN NOT NULL,
    "subconta_id" INTEGER,
    CONSTRAINT "categorias_subconta_id_fkey" FOREIGN KEY ("subconta_id") REFERENCES "subcontas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_categorias" ("id", "nome", "tipo", "grupo", "ativa", "casa", "eh_embutida", "subconta_id")
SELECT "id", "nome", "tipo", "grupo", "ativa", false, "eh_embutida", NULL
FROM "categorias";

DROP TABLE "categorias";
ALTER TABLE "new_categorias" RENAME TO "categorias";

CREATE UNIQUE INDEX "categorias_tipo_nome_key" ON "categorias"("tipo", "nome");
CREATE INDEX "categorias_subconta_id_idx" ON "categorias"("subconta_id");

CREATE TABLE "new_lancamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor" DECIMAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'nao_pago',
    "data_pagamento" DATETIME,
    "pessoa_id" INTEGER NOT NULL,
    "casa" BOOLEAN NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "subconta_id" INTEGER NOT NULL,
    "template_lancamento_id" INTEGER,
    "descricao" TEXT,
    CONSTRAINT "lancamentos_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_subconta_id_fkey" FOREIGN KEY ("subconta_id") REFERENCES "subcontas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_template_lancamento_id_fkey" FOREIGN KEY ("template_lancamento_id") REFERENCES "templates_lancamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_lancamentos" ("id", "data", "mes", "ano", "valor", "tipo", "status", "data_pagamento", "pessoa_id", "casa", "categoria_id", "subconta_id", "template_lancamento_id", "descricao")
SELECT "id", "data", "mes", "ano", "valor", "tipo", "status", "data_pagamento", "pessoa_id", "eh_casa", "categoria_id", "subconta_id", "template_lancamento_id", "descricao"
FROM "lancamentos";

DROP TABLE "lancamentos";
ALTER TABLE "new_lancamentos" RENAME TO "lancamentos";

CREATE INDEX "lancamentos_pessoa_id_idx" ON "lancamentos"("pessoa_id");
CREATE INDEX "lancamentos_categoria_id_idx" ON "lancamentos"("categoria_id");
CREATE INDEX "lancamentos_subconta_id_idx" ON "lancamentos"("subconta_id");
CREATE INDEX "lancamentos_template_lancamento_id_idx" ON "lancamentos"("template_lancamento_id");
CREATE INDEX "lancamentos_ano_mes_idx" ON "lancamentos"("ano", "mes");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
