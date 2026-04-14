# Database Workflow

## Recommended setup

- `server/.env`
  - your active app database
- `server/.env.test`
  - isolated test database used for validation and seed runs

## Suggested URLs

- real/app data: `DATABASE_URL="file:./prod.db"`
- test data: `DATABASE_URL="file:./test.db"`

## Safe test commands

Run all validations against the isolated test database:

```bash
npm --prefix server run prisma:generate:test
npm --prefix server run db:test:init
npm --prefix server run prisma:seed:test
npm --prefix server run start:test
```

You can also use the root shortcuts:

```bash
npm run db:test:validate
npm run db:test:init
npm run db:test:seed
npm run server:test
npm run dev:test
```

## Important

- do not run `seed` against the database from `server/.env` after you start filling real data
- prefer `*.test` scripts for development validation
- keep `server/.env` pointing to the database you actually want the app to use
