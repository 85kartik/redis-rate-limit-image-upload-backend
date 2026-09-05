/**
 * Starts multiple copies of server.js on different ports.
 * Run: node start-instances.js
 * (Requires a MONGO_URI and JWT_SECRET already set in .env)
 */

const { spawn } = require("child_process");

const PORTS = [3000, 3001, 3002, 3003];

PORTS.forEach((port) => {
  const child = spawn("node", ["server.js"], {
    env: { ...process.env, PORT: port },
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    console.log(`Instance on port ${port} exited with code ${code}`);
  });
});

console.log(`Started ${PORTS.length} backend instances on ports: ${PORTS.join(", ")}`);
