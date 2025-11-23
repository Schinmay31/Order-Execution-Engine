#  Order Execution Engine – DEX Router + WebSocket Updates

This project implements a **Market Order Execution Engine** with **DEX routing**, **BullMQ queueing**, **Redis pub/sub**, and **WebSocket live updates**. It is designed to demonstrate a robust, scalable backend architecture for real-time order processing.


We chose **Market Orders** as the primary focus because they represent the core execution flow—real-time status updates, routing logic, retries and queue orchestration without the added complexity of limit order books or on-chain monitoring. This allows for a cleaner demonstration of backend reliability and architecture.

# Public URl : https://order-execution-engine-okos.onrender.com

# endpoint : https://order-execution-engine-okos.onrender.com/api/orders/execute
method : GET

# payload : 
{
    "tokenIn": "SOL",
    "tokenOut": "USDC",
    "amount": "1",
    "orderType": "MARKET",
}

---

##  High-Level Architecture

### Major Components

*   **Fastify API + WebSocket server**: Handles client connections and real-time updates.
*   **Redis**:
    *   **Hash storage**: For active order state and metadata.
    *   **Pub/Sub**: For broadcasting live updates to clients.
*   **PostgreSQL**:
    *   **Persistent storage**: For order records and detailed execution logs.
*   **BullMQ (Redis-backed)**:
    *   **Order Queue**: Handles 10 concurrent jobs with rate limiting (100 orders/min).
    *   **Retries**: Exponential backoff with max 3 attempts.
*   **Mock DEX Engine**:
    *   Simulates Raydium & Meteora quotes.
    *   Handles slippage checks.
    *   Simulates realistic network delays (2–3s).
    *   **Randomized Failure Injection**: For testing error handling and retries.

---

##  Design Decision: WebSocket Flow

### The Problem with POST → Upgrade
The traditional approach of `POST /execute` followed by a WebSocket upgrade can lead to race conditions where the worker starts processing before the client has established the WebSocket connection, resulting in missed updates.

###  Improved Approach
1.  **Direct WebSocket Connection**: Client connects via `GET /api/orders/execute`.
2.  **Payload via WS**: Client sends the order payload directly over the established WebSocket.
3.  **Instant Creation**: Server creates the order and adds it to the queue immediately.
4.  **Live Streaming**: Updates are streamed from the very first state change.
5.  **Auto-Cleanup**: Connection closes automatically upon `confirmed` or `failed` status.

This ensures **zero missed messages**, lower latency and a simpler client implementation.


## 🛠 Setup & Deployment

### Prerequisites
*   Node.js v20+
*   Docker & Docker Compose (optional)
*   Redis instance
*   PostgreSQL instance

### Environment Variables
Create a `.env` file:
```env
PORT=3000
DATABASE_URL=postgres://user:pass@host:5432/db
REDIS_URL=redis://host:6379
DATABASE_SSL=true # if using cloud DB
```

### Running Locally
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Run Simulation Script**:
    To verify the flow with concurrent orders:
    ```bash
    npx ts-node scripts/test-flow.ts
    ```

### Running Tests
```cmd
npm run test
```

### Docker
```cmd
docker-compose build .
docker-compose up
docker-compose down
```

---

##  Testing Features

*   **Unit Tests**: Comprehensive Jest tests for routing, validation, and service logic.
*   **Simulation**: `scripts/test-flow.ts` simulates multiple concurrent orders to verify queue behavior and WebSocket broadcasting.
*   **Failure Injection**: The `DexEngine` has a ~15% chance to simulate a random on-chain failure, triggering the retry mechanism and allowing you to verify error handling.

---

##  Documentation

For a deep dive into the system design, data models, and sequence flows, please see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
