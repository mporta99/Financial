PRAGMA foreign_keys=OFF;

CREATE TABLE "new_lancamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor" DECIMAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'nao_pago',
    "data_pagamento" DATETIME,
    "contabiliza_saldo" BOOLEAN NOT NULL DEFAULT true,
    "pessoa_id" INTEGER NOT NULL,
    "casa" BOOLEAN NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "subconta_id" INTEGER NOT NULL,
    "template_lancamento_id" INTEGER,
    "item_template_id" INTEGER,
    "descricao" TEXT,
    CONSTRAINT "lancamentos_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_subconta_id_fkey" FOREIGN KEY ("subconta_id") REFERENCES "subcontas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_template_lancamento_id_fkey" FOREIGN KEY ("template_lancamento_id") REFERENCES "templates_lancamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lancamentos_item_template_id_fkey" FOREIGN KEY ("item_template_id") REFERENCES "itens_template" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_lancamentos" (
    "id", "data", "mes", "ano", "valor", "tipo", "status", "data_pagamento",
    "contabiliza_saldo", "pessoa_id", "casa", "categoria_id", "subconta_id",
    "template_lancamento_id", "item_template_id", "descricao"
)
SELECT
    "id", "data", "mes", "ano", "valor", "tipo", "status", "data_pagamento",
    true, "pessoa_id", "casa", "categoria_id", "subconta_id",
    "template_lancamento_id", NULL, "descricao"
FROM "lancamentos";

DROP TABLE "lancamentos";
ALTER TABLE "new_lancamentos" RENAME TO "lancamentos";

CREATE INDEX "lancamentos_pessoa_id_idx" ON "lancamentos"("pessoa_id");
CREATE INDEX "lancamentos_categoria_id_idx" ON "lancamentos"("categoria_id");
CREATE INDEX "lancamentos_subconta_id_idx" ON "lancamentos"("subconta_id");
CREATE INDEX "lancamentos_template_lancamento_id_idx" ON "lancamentos"("template_lancamento_id");
CREATE INDEX "lancamentos_item_template_id_idx" ON "lancamentos"("item_template_id");
CREATE INDEX "lancamentos_ano_mes_idx" ON "lancamentos"("ano", "mes");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
