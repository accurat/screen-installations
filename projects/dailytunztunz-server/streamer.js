const http = require("http");

function getData(cb) {
  http.get(
    {
      path: "/playing",
      hostname: "localhost",
      protocol: "http:",
      port: 5000
    },
    res => {
      res.on("data", d => cb(d.toString()));
    }
  );
}

function publish(listeners) {
  if (listeners.length === 0) return;
  getData(data => {
    for (const res of listeners) {
      res.write(data);
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
      "content-type": "application/json"
    });
    listeners[id] = res;
    req.on("close", () => {
      delete listeners[id];
    });
  });

  setInterval(() => publish(Object.values(listeners)), 1000);

  server.listen(5001);
}

startServer();
