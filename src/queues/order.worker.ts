import { Worker } from "bullmq";
import { bullRedisConnection } from "../config/bullmq.connection";
import DexEngine from "../dex/dexEngine";
import { redisConnection } from "../config/redis.connection";
import Redis from "ioredis";

let publisher: Redis;
let client: Redis;

(async () => {
  publisher = await redisConnection.redisPublisher();
  client = await redisConnection.initializeRedisClient();
})();

export const OrderWorker = new Worker(
  "order-queue",
  async (job) => {
    console.log("Worker received job:", job.id);

    // fetch order details from Redis
    const orderKey = `order:${job.data.orderId}`;
    const orderDetails = await client.hgetall(orderKey);

    // your core DEX logic
    const result = await DexEngine.processOrder(
      job.data.orderId,
      {
        tokenIn: orderDetails.tokenIn,
        tokenOut: orderDetails.tokenOut,
        amount: parseFloat(orderDetails.amount),
        orderId: job.data.orderId,
      },
      publisher,
      client
    );
    return result;
  },
  {
    ...bullRedisConnection,
    concurrency: 10, // <= Process 10 orders in parallel

    limiter: {
      max: 100, // <= Only process 100 orders per minute
      duration: 60_000,
    },
  }
);

OrderWorker.on("completed", (job, result) => {
  client.hset(`order:${job.data.orderId}`, { status: "confirmed" });

  // make entry in order logs and order model

  publisher.publish(
    "order_updates",
    JSON.stringify({
      orderId: job.data.orderId,
      status: "confirmed",
      payload: result,
    })
  );
  console.log(`Job ${job.id} completed`);
});

OrderWorker.on("failed", (job: any, err) => {
  console.error(`Job ${job.id} failed`, err);

  client.hset(`order:${job.data.orderId}`, { status: "confirmed" });

  // make entry in order logs and order model

  publisher.publish(
    "order_updates",
    JSON.stringify({
      orderId: job.data.orderId,
      status: "failed",
      payload: { error: err.message },
    })
  );
});
