import { App } from "./app";

const server = new App();

// Initialize and start
(async () => {
  await server.initialize();
  await server.listen();
})();

// Graceful shutdown
["SIGTERM", "SIGINT"].forEach((signal) => {
  process.on(signal, async () => {
    await server.close();
  });
});
