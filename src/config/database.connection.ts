import { Sequelize } from "sequelize";

import DOT_ENV from "../config-env";
const {
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_SSL_REJECT_UNAUTHORIZED,
  DATABASE_SSL_CA,
  DATABASE_SSL,
} = DOT_ENV;

export const sequelizeInstanceCreation = () => {
  return new Sequelize(
    DATABASE_NAME as string,
    DATABASE_USERNAME as string,
    DATABASE_PASSWORD as string,
    {
      host: DATABASE_HOST,
      dialect: "postgres",
      port: DATABASE_PORT,
      pool: {
        max: 100,
        min: 0,
        acquire: 60000,
      },
      timezone: "+05:30",
      ssl: DATABASE_SSL,
      dialectOptions: {
        ssl: {
          require: DATABASE_SSL,
          rejectUnauthorized: DATABASE_SSL_REJECT_UNAUTHORIZED,
          ca: [DATABASE_SSL_CA],
        },
      },
    }
  );
};

const sequelize = sequelizeInstanceCreation();

export const connectToDB = async () => {
  console.log("DATABASE_HOST: ", DATABASE_HOST);
  await sequelize.authenticate();
  if (sequelize) {
    console.log("Database Connected Successfully");
  } else {
    console.log("Something Went Wrong With Database Connection.");
  }
};

export { sequelize };
