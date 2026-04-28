# Production Rollout

## Databases

- `server/.env`: development and QAS database path, currently pointing to `test.db`
- `server/.env.prod`: production database path used only by explicit production scripts

Example:

```bash
DATABASE_URL="file:./prod.db"
```

Create `server/.env.prod` from `server/.env.prod.example` before using any production command.

## Backup commands

Run backups before any production schema change:

```bash
npm run db:backup:prod
```

Other useful commands:

```bash
npm run db:backup:dev
npm run db:backup:qas
```

Backups are written to `server/backups/` with a timestamp in the filename.

## Safe rollout steps

1. Stop the app/server process that is using the production database.
2. Confirm `server/.env.prod` points to the real production SQLite file.
3. Run `npm run db:backup:prod`.
4. Keep the backup file path from the command output.
5. Apply the new schema to the production database.
6. Start the server again and validate the templates page and monthly generation flow.

## Applying the current schema change

For the `quantidade_mensal` and `ocorrencia_mes` rollout, execute the migration SQL against the production database selected by `server/.env.prod`.

Suggested command:

```bash
cd server
npm run db:exec:prod -- --file prisma/migrations/20260415093000_template_quantidade_mensal_ocorrencia/migration.sql
```

Then regenerate the Prisma client if needed:

```bash
npm run prisma:generate:prod
```

## Restore

If something goes wrong:

1. Stop the server.
2. Copy the desired file from `server/backups/` over the production database file.
3. Start the server again.
