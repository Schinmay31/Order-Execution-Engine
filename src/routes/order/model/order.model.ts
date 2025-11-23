import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.connection";
import { OrderStatus, OrderType } from "../order.constants";

export const OrderModel = sequelize.define(
  "orders",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    tokenIn: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    tokenOut: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    orderType: {
      type: DataTypes.ENUM(...Object.values(OrderType)),
      allowNull: false,
    },

    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING,
      allowNull: false,
    },

    dex: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    quotedPrice: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    executedPrice: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    fee: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    txHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    liquidityUsed: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

export default OrderModel;
