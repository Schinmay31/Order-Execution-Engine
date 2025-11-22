import { Worker } from "bullmq";
import { bullRedisConnection } from "../config/bullmq.connection";
import DexEngine from "../dex/dexEngine";
import { redisConnection } from "../config/redis.connection";
import Redis from "ioredis";
import { orderUpdateRouter } from "../pubsub/orderUpdateRouter";

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
  bullRedisConnection
);

OrderWorker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed`);
  client.hset(`order:${job.data.orderId}`, { status: "confirmed" });

  publisher.publish(
    "order_updates",
    JSON.stringify({
      orderId: job.data.orderId,
      status: "confirmed",
      payload: result,
    })
  );
});

OrderWorker.on("failed", (job: any, err) => {
  console.error(`Job ${job.id} failed`, err);

  client.hset(`order:${job.data.orderId}`, { status: "confirmed" });

  publisher.publish(
    "order_updates",
    JSON.stringify({
      orderId: job.data.orderId,
      status: "failed",
      payload: { error: err.message },
    })
  );
});
