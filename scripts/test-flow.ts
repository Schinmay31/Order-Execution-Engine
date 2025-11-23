import WebSocket from "ws";

const WS_URL = "ws://localhost:3000/api/orders/execute";

interface OrderPayload {
  tokenIn: string;
  tokenOut: string;
  amount: number;
  orderType: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function simulateOrder(id: number, payload: OrderPayload) {
  return new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const prefix = `[Order ${id}]`;

    ws.on("open", () => {
      console.log(`${prefix} Connected`);
      
      // Wait a bit before sending order to ensure connection is ready
      setTimeout(() => {
        console.log(`${prefix} Sending order: ${payload.amount} ${payload.tokenIn} -> ${payload.tokenOut}`);
        ws.send(JSON.stringify(payload));
      }, 500);
    });

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.status === 'connected') {
        // Initial connection message, ignore or log
        return;
      }

      if (message.error) {
        console.error(`${prefix} ERROR:`, message.error, message.message);
      } else {
        console.log(`${prefix} Update: ${message.status}`);
        if (message.payload) {
            if(message.status === 'confirmed') {
                 console.log(`${prefix}  CONFIRMED | DEX: ${message.payload.selectedDex} | Price: ${message.payload.executedPrice} | TX: ${message.payload.txHash}`);
            } else if (message.status === 'failed') {
                 console.log(`${prefix}  FAILED | Reason: ${JSON.stringify(message.payload.error)}`);
            }
        }
      }
    });

    ws.on("close", (code, reason) => {
      console.log(`${prefix} Closed (${code}): ${reason}`);
      resolve();
    });

    ws.on("error", (err) => {
      console.error(`${prefix} WebSocket Error:`, err);
      reject(err);
    });
  });
}

async function runSimulation() {
  console.log(" Starting DEX Flow Simulation...");
  console.log("-----------------------------------");

  const orders = [
    { tokenIn: "SOL", tokenOut: "USDC", amount: 1.5, orderType: "market" },
    { tokenIn: "SOL", tokenOut: "USDC", amount: 10, orderType: "market" }, // Larger amount
    { tokenIn: "USDC", tokenOut: "SOL", amount: 50, orderType: "market" },
    { tokenIn: "ETH", tokenOut: "USDC", amount: 0.5, orderType: "market" },
    { tokenIn: "BTC", tokenOut: "USDC", amount: 0.1, orderType: "market" },
  ];

  try {
    const promises = orders.map((order, index) => simulateOrder(index + 1, order));
    await Promise.all(promises);
    console.log("-----------------------------------");
    console.log("Simulation Completed");
  } catch (error) {
    console.error("Simulation failed:", error);
  }
}

runSimulation();
