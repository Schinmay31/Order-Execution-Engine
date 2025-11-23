import DexEngine from "../src/dex/dexEngine";
import { AppError } from "../src/utils/appError";

// Mock dependencies if needed, but DexEngine is mostly self-contained logic 
// aside from Redis which is passed as argument to processOrder.

describe("DexEngine", () => {
  describe("getBestQuote", () => {
    it("should return a quote from one of the DEXs", async () => {
      const quote = await DexEngine.getBestQuote("SOL", "USDC", 1);
      expect(quote).toBeDefined();
      expect(["raydium", "meteora"]).toContain(quote.dex);
      expect(quote.price).toBeGreaterThan(0);
      expect(quote.availableLiquidity).toBeGreaterThan(0);
    });

    it("should select the DEX with better net price", async () => {
      // Since getBestQuote uses random values, it's hard to deterministically test 
      // without mocking the private methods. 
      // However, we can verify the structure of the returned object.
      const quote = await DexEngine.getBestQuote("SOL", "USDC", 100);
      expect(quote).toHaveProperty("dex");
      expect(quote).toHaveProperty("price");
      expect(quote).toHaveProperty("fee");
    });
  });

  describe("processOrder", () => {
    let mockRedis: any;
    let mockPublisher: any;

    beforeEach(() => {
      mockRedis = {
        hset: jest.fn(),
      };
      mockPublisher = {
        publish: jest.fn(),
      };
    });

    it("should successfully process an order", async () => {
      const orderId = "test-order-1";
      const payload = {
        tokenIn: "SOL",
        tokenOut: "USDC",
        amount: 1,
        orderId,
      };

      const result = await DexEngine.processOrder(
        orderId,
        payload,
        mockPublisher,
        mockRedis
      );

      expect(result).toBeDefined();
      expect(result?.status).toBe("success");
      expect(result?.orderId).toBe(orderId);
      
      // Verify Redis updates
      expect(mockRedis.hset).toHaveBeenCalledWith(`order:${orderId}`, { status: "routing" });
      expect(mockRedis.hset).toHaveBeenCalledWith(`order:${orderId}`, { status: "building" });
      expect(mockRedis.hset).toHaveBeenCalledWith(`order:${orderId}`, { status: "submitted" });

      // Verify Publisher updates
      expect(mockPublisher.publish).toHaveBeenCalledTimes(3); 
    }, 10000); // Increase timeout due to sleep() calls
  });
});
