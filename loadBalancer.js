// Simple Round-Robin Load Balancer

require("dotenv").config();

const http = require("http");
const httpProxy = require("http-proxy");

// Backend servers
const BACKENDS = [
  { host: "localhost", port: 3000 },
  { host: "localhost", port: 3001 },
  { host: "localhost", port: 3002 },
  { host: "localhost", port: 3003 },
];

// Load balancer port
const LB_PORT = process.env.LB_PORT || 8080;

// Create proxy
const proxy = httpProxy.createProxyServer({});

// Current server index
let currentIndex = 0;

// Get next backend server
function getNextBackend() {
  const backend = BACKENDS[currentIndex];

  currentIndex = (currentIndex + 1) % BACKENDS.length;

  return backend;
}

// Create load balancer server
const server = http.createServer((req, res) => {

  // Get next backend
  const target = getNextBackend();

  // Backend URL
  const targetUrl = `http://${target.host}:${target.port}`;

  // Forward request
  proxy.web(req, res, {
    target: targetUrl
  });

  // Show where request is going
  console.log(
    `[LB] ${req.method} ${req.url} -> ${targetUrl}`
  );
});

// Start load balancer
server.listen(LB_PORT, () => {

  console.log(
    `Load balancer running on http://localhost:${LB_PORT}`
  );

  console.log(
    "Backends:",
    BACKENDS.map(
      (backend) => `${backend.host}:${backend.port}`
    ).join(", ")
  );
});
