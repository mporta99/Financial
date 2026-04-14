UPDATE "categorias" SET "grupo" = 'Outros' WHERE "grupo" IN ('ganho', 'Ganho', 'variavel', 'Variavel', 'composicao', 'Composicao', 'Outros');
UPDATE "categorias" SET "grupo" = 'Essenciais' WHERE "grupo" IN ('fixo', 'Fixo', 'essencial', 'Essencial', 'Essenciais');
UPDATE "categorias" SET "grupo" = 'Conforto' WHERE "grupo" IN ('conforto', 'Conforto', 'assinatura', 'Assinatura');
UPDATE "categorias" SET "grupo" = 'Investimentos' WHERE "grupo" IN ('investimento', 'Investimento', 'Investimentos');
UPDATE "categorias" SET "grupo" = 'Cartao' WHERE "grupo" IN ('cartao', 'Cartão', 'Cartao');
