// src/pubsub/orderUpdateRouter.ts
import { EventEmitter } from 'events';
import { OrderStatus } from "../routes/order/order.constants";

class OrderUpdateRouter extends EventEmitter {
  private clientMap: Map<string, any> = new Map();

  register(orderId: string, ws: any) {
    this.clientMap.set(orderId, ws);
  }

  unregister(orderId: string) {
    this.clientMap.delete(orderId);
  }
  close(orderId: string, reason: string = "Order completed") {
    const ws = this.clientMap.get(orderId);
    if (ws && ws.readyState === 1) {
      ws.close(1000, reason);
    }
    this.unregister(orderId);
  }

  sendUpdate(orderId: string, update: any) {
    const ws = this.clientMap.get(orderId);
    if (ws && ws.readyState === 1) {
      // send the update via WebSocket
      ws.send(JSON.stringify(update));

      if (
        update.status === OrderStatus.CONFIRMED ||
        update.status === OrderStatus.FAILED
      ) {
        //  close the socket for final statuses
        this.close(orderId, `Order ${update.status}`);
      }
    }
  }
}

export const orderUpdateRouter = new OrderUpdateRouter();
