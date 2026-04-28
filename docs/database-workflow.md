# Database Workflow

## Recommended setup

- `server/.env`
  - development and QAS database used by the app in normal mode
- `server/.env.prod`
  - production database used only by explicit production scripts

## Suggested URLs

- active app data: `DATABASE_URL="file:./test.db"`
- production data: `DATABASE_URL="file:./prod.db"`

## Safe non-production commands

Run all day-to-day development and QAS commands against the non-production database:

```bash
npm --prefix server run prisma:generate
npm --prefix server run prisma:push
npm --prefix server run prisma:seed
npm --prefix server run start
```

You can also use the root shortcuts:

```bash
npm run db:dev:validate
npm run db:dev:seed
npm run server:qas
npm run dev
```

## Important

- do not run `seed` against the database from `server/.env` after you start filling real data
- keep `server/.env` for development and QAS only
- keep `server/.env.prod` out of git and use it only for explicit production commands
