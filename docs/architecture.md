# Architecture Notes

## Frontend

- React application in `client/`
- Space for drag-and-drop features in `client/src/features/drag-drop`
- Shared UI components in `client/src/components`

## Backend

- Lightweight Node.js API in `server/`
- Route/controller split for easier growth
- Placeholder in-memory data before database integration

## Database

- SQL schema and seed files in `database/`
- Ready to adapt to PostgreSQL, MySQL, or SQLite
