# 🏗 System Architecture & Design

This document details the architectural decisions, data flows, and component interactions of the Order Execution Engine.

##  Execution Pipeline

### 1. WebSocket Server (Fastify)
*   **Connection**: Accepts WebSocket connections at `/api/orders/execute`.
*   **Order Creation**: Validates payload, creates persistent record in PostgreSQL, and initializes Redis state.
*   **Queueing**: Adds a job to the `order-queue` in BullMQ.
*   **Broadcasting**: Subscribes to Redis Pub/Sub channels specific to the active orders to forward updates to clients.

### 2. BullMQ Queue
*   **Concurrency**: Configured to process **10 orders in parallel**.
*   **Rate Limiting**: **100 orders per minute** to prevent system overload.
*   **Reliability**: **Max 3 retries** with exponential backoff for transient failures.

### 3. Worker (Order Processor)
*   **Isolation**: Runs in the same process for simplicity but designed to be detachable.
*   **DexEngine Interaction**:
    *   Fetches quotes from mock DEXs (Raydium, Meteora).
    *   Selects the best route based on net price (after fees).
    *   Performs slippage checks against the quoted price.
    *   Simulates transaction building and execution delays.
*   **State Updates**: Publishes every state change (`routing`, `building`, `submitted`) to Redis.
*   **Finalization**: On `confirmed` or `failed`, writes the full execution log to PostgreSQL and cleans up Redis keys.

---

##  DEX Routing Logic

The `DexEngine` simulates a smart router:

1.  **Parallel Quoting**: Fetches quotes from multiple sources simultaneously.
2.  **Best Price Selection**:
    ```typescript
    effectivePrice = price * (1 - fee)
    ```
3.  **Slippage Protection**:
    ```typescript
    if (bestQuote.price > maxAcceptablePrice) throw AppError(ERROR_CODE.SLIPPAGE_EXCEEDED,"Slippage exceeded")
    ```

---

## Data Models

### Order Model (PostgreSQL)
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `tokenIn` | String | Source Token (e.g., SOL) |
| `tokenOut` | String | Destination Token (e.g., USDC) |
| `amount` | Float | Input Amount |
| `orderType` | Enum | Order Type (e.g., MARKET) |
| `status` | Enum | Current Status |
| `dex` | String | Selected DEX |
| `quotedPrice` | Float | Quoted price from DEX |
| `executedPrice` | Float | Executed price from DEX |
| `fee` | Float | Fee paid to DEX |
| `txHash` | String | Transaction Hash |
| `liquidityUsed` | Float | Liquidity used in the transaction |
| `createdAt` | Timestamp | Order creation time |
| `updatedAt` | Timestamp | Last update time |

### Order Logs Model (PostgreSQL)
Stores the final execution trace for auditing.
| Field | Type | Description |
|-------|------|-------------|
| `orderId` | UUID | Foreign Key |
| `status` | Enum | Final Status |
| `metadata` | JSON | Full execution details (prices, txHash) |
| `error` | JSON | Error details if failed |

---

##  Error Handling & Retries

The system is designed to be resilient:
*   **Transient Failures**: Network blips or DEX timeouts trigger a retry (up to 3x).
*   **Permanent Failures**: Logic errors or persistent network issues result in a `failed` status.
*   **Simulation**: The `DexEngine` includes a random failure generator to test these paths in development.
