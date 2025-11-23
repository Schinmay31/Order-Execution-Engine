import { randomUUID } from "crypto";
import { AppError } from "../utils/appError";
import { ERROR_CODES } from "../utils/master.constants";
import Redis from "ioredis";
import { OrderStatus } from "../routes/order/order.constants";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface QuoteResult {
  dex: "raydium" | "meteora";
  price: number;
  fee: number;
  availableLiquidity: number;
}

export interface ExecutionResult {
  txHash: string;
  executedPrice: number;
  dex: string;
}

// Mock base price
const BASE_PRICE = 1.23;

/**
 * Handles pulling best quotes from Raydium & Meteora,
 * performing slippage checks, retry logic, liquidity checks,
 * and swap execution.
 */
class DexEngine {
  SLIPPAGE_PERCENT = 1; // 1%
  MAX_RETRIES = 3;

  // fetch quote from Raydium
  private async getRaydiumQuote(
    tokenIn: string,
    tokenOut: string,
    amount: number
  ): Promise<QuoteResult> {
    await sleep(200 + Math.random() * 150); // realistic latency
    return {
      dex: "raydium",
      price: BASE_PRICE * (0.98 + Math.random() * 0.04),
      fee: 0.003,
      availableLiquidity: 100000 + Math.random() * 50000,
    };
  }

  // fetch quote from Meteora
  private async getMeteoraQuote(
    tokenIn: string,
    tokenOut: string,
    amount: number
  ): Promise<QuoteResult> {
    await sleep(200 + Math.random() * 150);
    return {
      dex: "meteora",
      price: BASE_PRICE * (0.97 + Math.random() * 0.05),
      fee: 0.002,
      availableLiquidity: 80000 + Math.random() * 60000,
    };
  }

  // Fetch quotes in parallel & determine the best DEX
  async getBestQuote(
    tokenIn: string,
    tokenOut: string,
    amount: number
  ): Promise<QuoteResult> {
    const [raydium, meteora] = await Promise.all([
      this.getRaydiumQuote(tokenIn, tokenOut, amount),
      this.getMeteoraQuote(tokenIn, tokenOut, amount),
    ]);

    // Edge case: insufficient liquidity
    if (
      raydium.availableLiquidity < amount &&
      meteora.availableLiquidity < amount
    ) {
      throw new AppError(
        ERROR_CODES.CONFLICT,
        "Insufficient liquidity across all DEXs"
      );
    }

    // Pick best by effective price after fee
    const raydiumNet = raydium.price * (1 - raydium.fee);
    const meteoraNet = meteora.price * (1 - meteora.fee);

    return raydiumNet > meteoraNet ? raydium : meteora;
  }

  // EXECUTION ENGINE
  private async executeSwap(
    dex: string,
    amount: number,
    expectedPrice: number
  ): Promise<ExecutionResult> {
    // Simulate 3–4 second on-chain time
    await sleep(2500 + Math.random() * 1200);

    // Execution price slightly differs from quote (market movement)
    const executedPrice = expectedPrice * (0.99 + Math.random() * 0.02);

    return {
      txHash: randomUUID().replace(/-/g, ""),
      executedPrice,
      dex,
    };
  }

  // BUILD TRANSACTION
  private async buildTransaction(): Promise<string> {
    // Simulate transaction building time
    await sleep(500 + Math.random() * 300);
    return `tx_${randomUUID().replace(/-/g, "")}`;
  }

  // Handles the end-to-end order processing: fetching quotes, slippage checks,
  // executing swap, retry logic, and final reporting.
  async processOrder(
    orderId: string,
    payload: {
      tokenIn: string;
      tokenOut: string;
      amount: number;
      orderId: string;
    },
    publisher: Redis,
    client: Redis
  ) {
    const { tokenIn, tokenOut, amount } = payload;

    let attempt = 0;

    while (attempt < this.MAX_RETRIES) {
      try {
        attempt++;

        // update order status to 'routing' in cache
        client.hset(`order:${orderId}`, { status: OrderStatus.ROUTING });

        // publish the updated status
        publisher.publish(
          "order_updates",
          JSON.stringify({
            orderId: orderId,
            status: OrderStatus.ROUTING,
          })
        );

        // Step 1: Fetch quotes
        const bestQuote = await this.getBestQuote(tokenIn, tokenOut, amount);

        // Slippage check
        const maxAcceptablePrice =
          bestQuote.price * (1 + this.SLIPPAGE_PERCENT / 100);

        if (bestQuote.price > maxAcceptablePrice) {
          throw new AppError(
            ERROR_CODES.NOT_ACCEPTABLE,
            "Slippage exceeded threshold"
          );
        }

        // Update order status to 'building' in cache
        client.hset(`order:${orderId}`, { status: OrderStatus.BUILDING });

        // publish the updated status
        publisher.publish(
          "order_updates",
          JSON.stringify({
            orderId: orderId,
            status: OrderStatus.BUILDING,
          })
        );
        await this.buildTransaction();

        // Transaction sent to network
        client.hset(`order:${orderId}`, { status: OrderStatus });
        publisher.publish(
          "order_updates",
          JSON.stringify({
            orderId: orderId,
            status: OrderStatus.SUBMITTED,
          })
        );
        // Step 2: Execute swap
        const execution = await this.executeSwap(
          bestQuote.dex,
          amount,
          bestQuote.price
        );

        return {
          orderId,
          selectedDex: bestQuote.dex,
          quotedPrice: bestQuote.price,
          executedPrice: execution.executedPrice,
          fee: bestQuote.fee,
          txHash: execution.txHash,
          liquidityUsed: amount,
          attempt,
          status: "success",
        };
      } catch (err: any) {
        console.error(`Execution attempt ${attempt} failed: ${err.message}`);

        if (attempt >= this.MAX_RETRIES) {
          return {
            orderId,
            status: "failed",
            reason: err.message,
            attempt,
          };
        }

        // retry delay
        await sleep(500);
      }
    }
  }
}

export default new DexEngine();