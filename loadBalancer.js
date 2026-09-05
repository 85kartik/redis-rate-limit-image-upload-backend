/**
 * Simple round-robin load balancer for this backend.
 *
 * Run instances first:   node start-instances.js
 * Then run the balancer: node loadBalancer.js
 * Point your client at:  http://localhost:8080  (instead of :3000 directly)
 */

require("dotenv").config();
const http = require("http");
const httpProxy = require("http-proxy");

const BACKENDS = [
  { host: "localhost", port: 3000 },
  { host: "localhost", port: 3001 },
  { host: "localhost", port: 3002 },
  { host: "localhost", port: 3003 },
];

const LB_PORT = process.env.LB_PORT || 8080;
const proxy = httpProxy.createProxyServer({});
const backendState = BACKENDS.map((b) => ({ ...b, alive: true }));

let currentIndex = 0;

function getNextBackend() {
  const aliveBackends = backendState.filter((b) => b.alive);
  if (aliveBackends.length === 0) return null;
  currentIndex = (currentIndex + 1) % aliveBackends.length;
  return aliveBackends[currentIndex];
}

const server = http.createServer((req, res) => {
  const target = getNextBackend();

  if (!target) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "No backend servers available" }));
    return;
  }

  const targetUrl = `http://${target.host}:${target.port}`;

  proxy.web(req, res, { target: targetUrl }, (err) => {
    console.error(`Error forwarding to ${targetUrl}:`, err.message);

    const failed = backendState.find((b) => b.host === target.host && b.port === target.port);
    if (failed) failed.alive = false;

    setTimeout(() => {
      if (failed) failed.alive = true;
    }, 10000);

    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Bad gateway" }));
    }
  });

  console.log(`[LB] ${req.method} ${req.url} -> ${targetUrl}`);
});

server.listen(LB_PORT, () => {
  console.log(`Load balancer running on http://localhost:${LB_PORT}`);
  console.log("Forwarding to:", backendState.map((b) => `${b.host}:${b.port}`).join(", "));
});
