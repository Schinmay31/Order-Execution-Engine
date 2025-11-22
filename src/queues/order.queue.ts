import { Queue } from "bullmq";
import { bullRedisConnection } from "../config/bullmq.connection";

export const OrderQueue = new Queue("order-queue", bullRedisConnection);
