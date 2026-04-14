const path = require("path");
const { spawn } = require("child_process");
const dotenv = require("dotenv");

const [, , envFile, command, ...args] = process.argv;

if (!envFile || !command) {
  console.error("Usage: node scripts/run-with-env.js <env-file> <command> [args...]");
  process.exit(1);
}

const envPath = path.resolve(process.cwd(), envFile);
const parsed = dotenv.config({ path: envPath });

if (parsed.error) {
  console.error(`Failed to load env file: ${envPath}`);
  console.error(parsed.error.message);
  process.exit(1);
}

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    ...parsed.parsed
  },
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
