const { spawn } = require("child_process");

const isWindows = process.platform === "win32";
const children = [];
const mode = process.argv[2] === "test" ? "test" : "default";

function startProcess(name, command, color) {
  const child = spawn(command, {
    cwd: process.cwd(),
    env: process.env,
    shell: isWindows,
    stdio: ["inherit", "pipe", "pipe"]
  });

  const prefix = `\x1b[${color}m[${name}]\x1b[0m`;

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`${prefix} ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`${prefix} ${chunk}`);
  });

  child.on("exit", (code) => {
    const message = `${prefix} exited with code ${code}\n`;
    if (!shuttingDown) {
      process.stderr.write(message);
      shutdown(code ?? 0);
      return;
    }

    process.stdout.write(message);
  });

  children.push(child);
  return child;
}

let shuttingDown = false;

function shutdown(exitCode) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
    }
    process.exit(exitCode);
  }, 500);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

startProcess("server", mode === "test" ? "npm run server:test:dev" : "npm run server:dev", "36");
startProcess("client", "npm run client:dev", "35");
