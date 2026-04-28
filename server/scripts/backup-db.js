const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

function fail(message) {
  console.error(message);
  process.exit(1);
}

const [, , envFile = ".env", label = "manual"] = process.argv;
const envPath = path.resolve(process.cwd(), envFile);

if (!fs.existsSync(envPath)) {
  fail(`Env file not found: ${envPath}`);
}

const loaded = dotenv.config({ path: envPath });

if (loaded.error) {
  fail(`Failed to load env file: ${envPath}`);
}

const databaseUrl = loaded.parsed?.DATABASE_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  fail("DATABASE_URL not found in env file.");
}

if (!databaseUrl.startsWith("file:")) {
  fail(`Only SQLite file URLs are supported. Received: ${databaseUrl}`);
}

const relativeDbPath = databaseUrl.slice("file:".length);
const candidates = [
  path.resolve(process.cwd(), relativeDbPath),
  path.resolve(process.cwd(), "prisma", relativeDbPath)
];
const sourcePath = candidates.find((candidate) => fs.existsSync(candidate));

if (!sourcePath) {
  fail(`Database file not found. Tried: ${candidates.join(", ")}`);
}

const backupsDir = path.resolve(process.cwd(), "backups");
fs.mkdirSync(backupsDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const sourceName = path.basename(sourcePath, path.extname(sourcePath));
const extension = path.extname(sourcePath) || ".db";
const targetName = `${sourceName}-${label}-${timestamp}${extension}`;
const targetPath = path.join(backupsDir, targetName);

fs.copyFileSync(sourcePath, targetPath);

const sourceSize = fs.statSync(sourcePath).size;
const targetSize = fs.statSync(targetPath).size;

if (sourceSize !== targetSize) {
  fail(`Backup size mismatch. Source=${sourceSize} Target=${targetSize}`);
}

console.log(`Backup created: ${targetPath}`);
