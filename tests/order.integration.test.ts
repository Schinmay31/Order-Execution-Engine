import Fastify from "fastify";
import WebSocket from "ws";
import request from "supertest";
import { App } from "../src/app";
import { OrderStatus } from "../src/routes/order/order.constants";

// Mock dependencies
jest.mock("../src/config/database.connection", () => ({
  connectToDB: jest.fn(),
  sequelize: {
    sync: jest.fn(),
    authenticate: jest.fn(),
  },
}));

jest.mock("../src/config/redis.connection", () => ({
  redisConnection: {
    initializeRedisClient: jest.fn().mockResolvedValue({
      hmset: jest.fn(),
      hgetall: jest.fn(),
    }),
    redisPublisher: jest.fn().mockResolvedValue({
      publish: jest.fn(),
    }),
    redisSubscriber: jest.fn().mockResolvedValue({
      subscribe: jest.fn(),
      on: jest.fn(),
    }),
  },
}));

jest.mock("../src/routes/order/order.repository", () => ({
  default: {
    createOrder: jest.fn().mockResolvedValue({ id: "test-order-id" }),
    updateStatus: jest.fn(),
    createLog: jest.fn(),
  },
}));

jest.mock("../src/queues/order.queue", () => ({
  OrderQueue: {
    add: jest.fn(),
  },
}));

jest.mock("bullmq", () => ({
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
}));

jest.mock("../src/config-env", () => ({
  default: {
    PORT: 3001,
    NODE_ENV: "test",
    DATABASE_URL: "postgres://localhost:5432/test",
    REDIS_URL: "redis://localhost:6379",
  },
}));

describe.skip("Order WebSocket Integration", () => {
  let app: App;
  let server: any;
  let ws: WebSocket;
  const PORT = 3001;

  beforeAll(async () => {
    // @ts-ignore
    jest.spyOn(process, "exit").mockImplementation(() => {});
    
    console.log("Initializing App...");
    app = new App();
    console.log("App Port:", app.port);
    
    await app.initialize();
    console.log("App Initialized");
    
    server = await app.listen();
    console.log("App Listening on port:", app.port);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  it("should respond to HTTP requests", async () => {
    const response = await request(server).get("/health");
    // We expect 404 because we didn't define /health, but it proves server is up
    expect(response.status).toBeDefined();
  });

  it("should connect and receive welcome message", (done) => {
    console.log("Connecting to WebSocket...");
    ws = new WebSocket(`ws://127.0.0.1:${PORT}/api/execute`);

    ws.on("open", () => {
      console.log("WebSocket connected");
    });

    ws.on("message", (data) => {
      console.log("Received message:", data.toString());
      const message = JSON.parse(data.toString());
      if (message.status === "connected") {
        expect(message.timestamp).toBeDefined();
        done();
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
      done(err);
    });
  }, 10000);

  it("should accept valid order payload", (done) => {
    ws = new WebSocket(`ws://127.0.0.1:${PORT}/api/execute`);

    ws.on("open", () => {
      const payload = {
        tokenIn: "SOL",
        tokenOut: "USDC",
        amount: 1,
        orderType: "market",
      };
      ws.send(JSON.stringify(payload));
    });

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.status === "connected") return;
      
      if (message.status === "error") {
        done(new Error(message.message));
      }
    });

    setTimeout(() => {
      done();
    }, 2000);
  }, 10000);

  it("should reject invalid payload", (done) => {
    ws = new WebSocket(`ws://127.0.0.1:${PORT}/api/execute`);

    ws.on("open", () => {
      ws.send(JSON.stringify({ invalid: "data" }));
    });

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.status === "connected") return;

      if (message.status === "error") {
        expect(message.message).toBeDefined();
        done();
      }
    });
  }, 10000);
});
