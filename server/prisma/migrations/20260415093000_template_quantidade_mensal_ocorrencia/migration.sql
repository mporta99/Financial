PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

ALTER TABLE "templates_lancamento" ADD COLUMN "quantidade_mensal" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "lancamentos" ADD COLUMN "ocorrencia_mes" INTEGER;

CREATE INDEX "lancamentos_template_lancamento_id_pessoa_id_ano_mes_ocorrencia_mes_idx"
ON "lancamentos"("template_lancamento_id", "pessoa_id", "ano", "mes", "ocorrencia_mes");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
