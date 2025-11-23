import { Worker } from "bullmq";
import { bullRedisConnection } from "../config/bullmq.connection";
import DexEngine from "../dex/dexEngine";
import { redisConnection } from "../config/redis.connection";
import Redis from "ioredis";
import { OrderStatus } from "../routes/order/order.constants";
import orderRepo from "../routes/order/order.repository";

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

    // core DEX logic
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

OrderWorker.on("completed", async (job, result) => {
  client.hset(`order:${job.data.orderId}`, { status: OrderStatus.CONFIRMED });

  // make entry in order logs and order model
  await orderRepo.updateStatus({
    orderId: job.data.orderId,
    status: OrderStatus.CONFIRMED,
    payload: result,
  });
  publisher.publish(
    "order_updates",
    JSON.stringify({
      orderId: job.data.orderId,
      status: OrderStatus.CONFIRMED,
      payload: result,
    })
  );
  console.log(`order confirmed -> ${job.data.orderId}`);
});

OrderWorker.on("failed", async (job: any, err :any) => {
  console.error(`Job ${job.id} failed`, err);

  client.hset(`order:${job.data.orderId}`, { status: OrderStatus.FAILED });

  // make entry in order logs and order model
  await orderRepo.updateStatus({
    orderId: job.data.orderId,
    status: OrderStatus.FAILED,
  });

  publisher.publish(
    "order_updates",
    JSON.stringify({
      orderId: job.data.orderId,
      status: OrderStatus.FAILED,
      payload: { error: err.errorList },
    })
  );
  console.log(`order failed -> ${job.data.orderId}`);
});
