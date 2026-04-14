CREATE TABLE "pessoas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL
);

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
    "ativa" BOOLEAN NOT NULL,
    "casa" BOOLEAN NOT NULL,
    "embutido" BOOLEAN NOT NULL,
    "subconta_id" INTEGER,
    CONSTRAINT "categorias_subconta_id_fkey" FOREIGN KEY ("subconta_id") REFERENCES "subcontas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "lancamentos" (
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

CREATE TABLE "transferencias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planejada',
    "data_realizacao" DATETIME,
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

CREATE TABLE "templates_lancamento" (
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

CREATE INDEX "subcontas_carteira_id_idx" ON "subcontas"("carteira_id");
CREATE UNIQUE INDEX "subcontas_carteira_id_nome_key" ON "subcontas"("carteira_id", "nome");
CREATE UNIQUE INDEX "pessoas_nome_key" ON "pessoas"("nome");
CREATE UNIQUE INDEX "categorias_tipo_nome_key" ON "categorias"("tipo", "nome");
CREATE INDEX "categorias_subconta_id_idx" ON "categorias"("subconta_id");
CREATE INDEX "lancamentos_pessoa_id_idx" ON "lancamentos"("pessoa_id");
CREATE INDEX "lancamentos_categoria_id_idx" ON "lancamentos"("categoria_id");
CREATE INDEX "lancamentos_subconta_id_idx" ON "lancamentos"("subconta_id");
CREATE INDEX "lancamentos_template_lancamento_id_idx" ON "lancamentos"("template_lancamento_id");
CREATE INDEX "lancamentos_item_template_id_idx" ON "lancamentos"("item_template_id");
CREATE INDEX "lancamentos_ano_mes_idx" ON "lancamentos"("ano", "mes");
CREATE INDEX "transferencias_subconta_origem_id_idx" ON "transferencias"("subconta_origem_id");
CREATE INDEX "transferencias_subconta_destino_id_idx" ON "transferencias"("subconta_destino_id");
CREATE INDEX "transferencias_ano_mes_idx" ON "transferencias"("ano", "mes");
CREATE INDEX "categorias_subcontas_categoria_id_idx" ON "categorias_subcontas"("categoria_id");
CREATE INDEX "categorias_subcontas_subconta_id_idx" ON "categorias_subcontas"("subconta_id");
CREATE UNIQUE INDEX "categorias_subcontas_categoria_id_subconta_id_key" ON "categorias_subcontas"("categoria_id", "subconta_id");
CREATE INDEX "templates_lancamento_categoria_id_idx" ON "templates_lancamento"("categoria_id");
CREATE INDEX "templates_lancamento_pessoa_id_idx" ON "templates_lancamento"("pessoa_id");
CREATE INDEX "itens_template_template_pai_id_idx" ON "itens_template"("template_pai_id");
CREATE INDEX "itens_template_categoria_id_idx" ON "itens_template"("categoria_id");
