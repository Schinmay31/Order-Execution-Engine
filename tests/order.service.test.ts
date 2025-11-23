import orderService from "../src/routes/order/order.service";
import orderRepo from "../src/routes/order/order.repository";
import { OrderQueue } from "../src/queues/order.queue";
import { orderUpdateRouter } from "../src/pubsub/orderUpdateRouter";
import { OrderStatus } from "../src/routes/order/order.constants";

// Mock dependencies
jest.mock("../src/routes/order/order.repository");
jest.mock("../src/queues/order.queue");
jest.mock("../src/pubsub/orderUpdateRouter");

describe("OrderService", () => {
  let mockSocket: any;
  let mockPublisher: any;
  let mockRedisClient: any;

  beforeEach(() => {
    mockSocket = {};
    mockPublisher = {
      publish: jest.fn(),
    };
    mockRedisClient = {
      hmset: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create an order and add to queue", async () => {
      const payload = {
        tokenIn: "SOL",
        tokenOut: "USDC",
        amount: 1,
        orderType: "market",
      };

      const mockOrder = { id: "order-123", ...payload };
      (orderRepo.createOrder as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.createOrder(
        payload,
        mockSocket,
        mockPublisher,
        mockRedisClient
      );

      expect(result).toEqual(mockOrder);
      expect(orderRepo.createOrder).toHaveBeenCalledWith(payload);
      expect(mockRedisClient.hmset).toHaveBeenCalledWith(
        `order:${mockOrder.id}`,
        expect.objectContaining({
          status: "pending",
        })
      );
      expect(orderUpdateRouter.register).toHaveBeenCalledWith(
        mockOrder.id,
        mockSocket
      );
      expect(OrderQueue.add).toHaveBeenCalledWith("execute_order", {
        orderId: mockOrder.id,
      });
      expect(mockPublisher.publish).toHaveBeenCalledWith(
        "order_updates",
        expect.stringContaining(OrderStatus.PENDING)
      );
    });
  });
});
