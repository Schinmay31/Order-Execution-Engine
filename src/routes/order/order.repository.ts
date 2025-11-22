import OrderModel from "./order.model";

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
}

export default orderRepo;
