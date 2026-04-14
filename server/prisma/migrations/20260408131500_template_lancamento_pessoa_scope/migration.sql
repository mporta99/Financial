PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_templates_lancamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "pessoa_id" INTEGER,
    "ativo" BOOLEAN NOT NULL,
    "frequencia" TEXT NOT NULL,
    "tipo_geracao" TEXT NOT NULL,
    "dia_fixo" INTEGER,
    "tem_valor_fixo" BOOLEAN NOT NULL,
    "valor_padrao" DECIMAL,
    "gera_lancamento" BOOLEAN NOT NULL,
    CONSTRAINT "templates_lancamento_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "templates_lancamento_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_templates_lancamento" ("id", "nome", "categoria_id", "ativo", "frequencia", "tipo_geracao", "dia_fixo", "tem_valor_fixo", "valor_padrao", "gera_lancamento")
SELECT "id", "nome", "categoria_id", "ativo", "frequencia", "tipo_geracao", "dia_fixo", "tem_valor_fixo", "valor_padrao", "gera_lancamento"
FROM "templates_lancamento";
DROP TABLE "templates_lancamento";
ALTER TABLE "new_templates_lancamento" RENAME TO "templates_lancamento";
CREATE INDEX "templates_lancamento_categoria_id_idx" ON "templates_lancamento"("categoria_id");
CREATE INDEX "templates_lancamento_pessoa_id_idx" ON "templates_lancamento"("pessoa_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
