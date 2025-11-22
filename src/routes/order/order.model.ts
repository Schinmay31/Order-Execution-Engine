import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.connection";

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
      type: DataTypes.ENUM("market", "limit", "sniper"),
      allowNull: false,
    },

    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "routing",
        "building",
        "submitted",
        "confirmed",
        "failed"
      ),
      defaultValue: "pending",
      allowNull: false,
    },

    dex: {
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
