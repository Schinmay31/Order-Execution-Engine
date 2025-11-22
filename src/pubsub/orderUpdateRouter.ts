// src/pubsub/orderUpdateRouter.ts
import { EventEmitter } from 'events';

class OrderUpdateRouter extends EventEmitter {
  private clientMap: Map<string, any> = new Map();

  register(orderId: string, ws: any) {
    this.clientMap.set(orderId, ws);
  }

  unregister(orderId: string) {
    this.clientMap.delete(orderId);
  }

  sendUpdate(orderId: string, update: any) {
    const ws = this.clientMap.get(orderId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(update));
    }
  }
}

export const orderUpdateRouter = new OrderUpdateRouter();
