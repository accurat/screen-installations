const http = require("http");

function getData(cb) {
  http
    .get(
      {
        path: "/playing",
        hostname: "localhost",
        protocol: "http:",
        port: 5000
      },
      res => res.on("data", d => cb(d.toString()))
    )
    .on("error", err => cb(""));
}

function publish(listeners) {
  const list = Object.entries(listeners);
  if (list.length === 0) return;
  getData(data => {
    for (const [id, res] of list) {
      res.write(`data: ${data}\n\n`);
    }
  });
}

function startServer() {
  const listeners = {};

  const server = http.createServer((req, res) => {
    const id = Date.now();
    res.writeHead(200, {
      connection: "keep-alive",
      "cache-control": "no-cache",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Request-Method": "*",
      "Access-Control-Allow-Methods": "OPTIONS, GET",
      "Access-Control-Allow-Headers": "*",
      "content-type": "text/event-stream"
    });

    if (req.method === "OPTIONS") {
      res.end();
      return;
    }

    listeners[id] = res;
    req.on("close", () => {
      delete listeners[id];
    });
  });

  setInterval(() => publish(listeners), 1000);

  server.listen(5001);
}

startServer();
