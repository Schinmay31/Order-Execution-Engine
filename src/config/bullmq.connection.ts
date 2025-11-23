import DOT_ENV from "../config-env";

export const bullRedisConnection = {
  connection: {
    url: DOT_ENV.REDIS_URL
  }
};
