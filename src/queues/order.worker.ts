import { Worker } from "bullmq";
import { bullRedisConnection } from "../config/bullmq.connection";
// import { processOrder } from "../modules/order/order.service";

export const OrderWorker = new Worker(
  "order-queue",
  async (job) => {
    console.log(" Worker received job:", job.id);

    // const result = await processOrder(job.data); // your core DEX logic

    // return result;
  },
  bullRedisConnection
);

OrderWorker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed`);
});

OrderWorker.on("failed", (job: any, err) => {
  console.error(`Job ${job.id} failed`, err);
});
