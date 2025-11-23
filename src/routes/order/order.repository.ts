import OrderModel from "./model/order.model";
import { OrderLogsModel } from "./model/orderLogs.model";

class orderRepo {
  static async createOrder(data: {
    tokenIn: string;
    tokenOut: string;
    amount: number;
    orderType: string;
  }) {
    const order = await OrderModel.create({
      tokenIn: data.tokenIn,
      tokenOut: data.tokenOut,
      amount: data.amount,
      orderType: data.orderType,
    });

    return order.toJSON();
  }

  static async updateStatus(data: { orderId: string; status: string }) {
    const { orderId, status } = data;
    const [rowsUpdated, [updatedOrder]] = await OrderModel.update(
      { status },
      {
        where: { id: orderId },
        returning: true,
      }
    );
    return updatedOrder.toJSON();
  }

  static async createLog(data: {
    orderId: string;
    status: string;
    metadata?: any;
    error?: string;
  }) {
    const log = await OrderLogsModel.create({
      orderId: data.orderId,
      status: data.status,
      metadata: data.metadata,
      error: data.error,
    });
    return log.toJSON();
  }
}


export default orderRepo;
