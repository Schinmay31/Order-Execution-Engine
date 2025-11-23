export const validateOrderPayload = (payload : any) => {
  if (typeof payload !== "object" || payload === null) {
    return "Payload must be a valid object";
  }

  // tokenIn
  if (typeof payload.tokenIn !== "string" || !payload.tokenIn.trim()) {
    return "tokenIn must be a non-empty string";
  }

  // tokenOut
  if (typeof payload.tokenOut !== "string" || !payload.tokenOut.trim()) {
    return "tokenOut must be a non-empty string";
  }

  // amount
  if (typeof payload.amount !== "number" || payload.amount <= 0) {
    return "amount must be a positive number";
  }

  // orderType
  const allowedOrderTypes = ["market"]; // you can add "limit", "sniper" later
  if (!allowedOrderTypes.includes(payload.orderType)) {
    return `orderType must be one of: ${allowedOrderTypes.join(", ")}`;
  }

  return null; // null means valid
}
