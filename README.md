# Financial App

Aplicacao financeira em monorepo com frontend React e backend Node.js.

## Estrutura

- `client/` frontend React
- `server/` API Node.js com Prisma
- `database/` espaco para artefatos auxiliares de banco
- `docs/` notas de arquitetura e produto

## Banco de dados

O projeto agora usa SQLite com Prisma. Nao e mais necessario Docker nem PostgreSQL.

## Ambientes

- `server/.env`: banco de desenvolvimento e QAS
- `server/.env.prod`: banco de producao

Arquivos de exemplo:

- `server/.env.example`
- `server/.env.prod.example`

## Desenvolvimento

1. Crie `server/.env` a partir de `server/.env.example`
2. Gere o schema local:

```bash
npm --prefix server run prisma:generate
npm --prefix server run prisma:push
```

3. Se quiser popular a base local:

```bash
npm --prefix server run prisma:seed
```

Valor padrao do banco:

```env
DATABASE_URL="file:./test.db"
```

## Comandos uteis de DEV e QAS

Subir frontend + backend no ambiente nao produtivo:

```bash
npm run dev
```

Alias equivalente:

```bash
npm run qas
```

Popular ou validar o banco de DEV e QAS:

```bash
npm run db:dev:seed
npm run db:dev:validate
```

## Producao

1. Crie `server/.env.prod` a partir de `server/.env.prod.example`
2. Antes de qualquer alteracao de schema, rode:

```bash
npm run db:backup:prod
```

Para subir a stack completa de producao localmente:

```bash
npm run prod
```

URLs:

- DEV e QAS: `http://localhost:5173`
- Producao local: `http://localhost:4173`

O fluxo detalhado de rollout esta em [docs/production-rollout.md](./docs/production-rollout.md).
