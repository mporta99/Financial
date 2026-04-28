const { spawn, spawnSync } = require("child_process");

const isWindows = process.platform === "win32";
const children = [];
let shuttingDown = false;

function runStep(name, command) {
  const result = spawnSync(command, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      VITE_API_BASE_URL: "http://localhost:4000/api"
    },
    shell: isWindows,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  if (result.error) {
    console.error(`[${name}] ${result.error.message}`);
    process.exit(1);
  }
}

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
}

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

runStep("client-build", "npm run client:build");
startProcess("server", "npm run server:start:prod", "36");
startProcess("client", "npm run client:preview", "35");
