import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.connection";
import { OrderModel } from "./order.model"; 
import { OrderStatus } from "../order.constants";


export const OrderLogsModel = sequelize.define(
  "order_logs",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: OrderModel,
        key: "id",
      },
      onDelete: "CASCADE",
    },

    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
    },

    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },

    error: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

OrderLogsModel.belongsTo(OrderModel, {
  foreignKey: "orderId",
  as: "order",
  onDelete: "CASCADE",
});

OrderModel.hasMany(OrderLogsModel, {
  foreignKey: "orderId",
  as: "logs",
});
