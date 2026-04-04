PRAGMA foreign_keys=OFF;

CREATE TABLE "new_categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL,
    "eh_embutida" BOOLEAN NOT NULL
);

INSERT INTO "new_categorias" (
    "id",
    "nome",
    "tipo",
    "grupo",
    "ativa",
    "eh_embutida"
)
SELECT
    "id",
    "nome",
    "tipo",
    "grupo",
    "ativa",
    0
FROM "categorias";

DROP TABLE "categorias";
ALTER TABLE "new_categorias" RENAME TO "categorias";

CREATE UNIQUE INDEX "categorias_tipo_nome_key" ON "categorias"("tipo", "nome");

CREATE TABLE "templates_lancamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "frequencia" TEXT NOT NULL,
    "tipo_geracao" TEXT NOT NULL,
    "dia_fixo" INTEGER,
    "tem_valor_fixo" BOOLEAN NOT NULL,
    "valor_padrao" DECIMAL,
    "gera_lancamento" BOOLEAN NOT NULL,
    CONSTRAINT "templates_lancamento_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "itens_template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "template_pai_id" INTEGER NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "tem_valor_fixo" BOOLEAN NOT NULL,
    "valor_padrao" DECIMAL,
    "dia_fixo" INTEGER,
    CONSTRAINT "itens_template_template_pai_id_fkey" FOREIGN KEY ("template_pai_id") REFERENCES "templates_lancamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "itens_template_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "templates_lancamento_categoria_id_idx" ON "templates_lancamento"("categoria_id");
CREATE INDEX "itens_template_template_pai_id_idx" ON "itens_template"("template_pai_id");
CREATE INDEX "itens_template_categoria_id_idx" ON "itens_template"("categoria_id");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
