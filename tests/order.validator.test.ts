import { validateOrderPayload } from "../src/routes/order/order.validator";

describe("OrderValidator", () => {
  it("should return null for a valid payload", () => {
    const payload = {
      tokenIn: "SOL",
      tokenOut: "USDC",
      amount: 1,
      orderType: "market",
    };
    const error = validateOrderPayload(payload);
    expect(error).toBeNull();
  });

  it("should return error if tokenIn is missing", () => {
    const payload = {
      tokenOut: "USDC",
      amount: 1,
      orderType: "market",
    } as any;
    const error = validateOrderPayload(payload);
    expect(error).toBe("tokenIn must be a non-empty string");
  });

  it("should return error if tokenOut is missing", () => {
    const payload = {
      tokenIn: "SOL",
      amount: 1,
      orderType: "market",
    } as any;
    const error = validateOrderPayload(payload);
    expect(error).toBe("tokenOut must be a non-empty string");
  });

  it("should return error if amount is missing", () => {
    const payload = {
      tokenIn: "SOL",
      tokenOut: "USDC",
      orderType: "market",
    } as any;
    const error = validateOrderPayload(payload);
    expect(error).toBe("amount must be a positive number");
  });

  it("should return error if amount is not a number", () => {
    const payload = {
      tokenIn: "SOL",
      tokenOut: "USDC",
      amount: "invalid",
      orderType: "market",
    } as any;
    const error = validateOrderPayload(payload);
    expect(error).toBe("amount must be a positive number");
  });

  it("should return error if amount is negative", () => {
    const payload = {
      tokenIn: "SOL",
      tokenOut: "USDC",
      amount: -1,
      orderType: "market",
    };
    const error = validateOrderPayload(payload);
    expect(error).toBe("amount must be a positive number");
  });
});
