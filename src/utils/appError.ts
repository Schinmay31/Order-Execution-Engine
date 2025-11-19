import { ERROR_CODES, HttpStatusCodes as status } from "./master.constants";

export class AppError extends Error {
  status: number;
  errorList: any;
  constructor(error: string, errorList: any) {
    super(appErrors[error as any].message);
    this.status = appErrors[error as any ] ? appErrors[error as any].status : 500;
    this.name = this.constructor.name;
    this.errorList = errorList;
  }

  statusCode() {
    return this.status;
  }
  getErrorList() {
    return this.errorList;
  }
}
const appErrors = {
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    status: status.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
  },
  [ERROR_CODES.BAD_REQUEST]: {
    status: status.BAD_REQUEST,
    message: "Bad request",
  },
  [ERROR_CODES.UNAUTHORIZED]: {
    status: status.UNAUTHORIZED,
    message: "User unauthorized",
  },
  [ERROR_CODES.NOT_FOUND]: {
    status: status.NOT_FOUND,
    message: "Not Found",
  },
  [ERROR_CODES.CONFLICT]: {
    status: status.CONFLICT,
    message: "Already exists",
  },
  [ERROR_CODES.TOO_MANY_REQUESTS]: {
    status: status.TOO_MANY_REQUESTS,
    message: "Too many requests",
  },
  [ERROR_CODES.VALIDATION_ERROR]: {
    status: status.BAD_REQUEST,
    message: "Validation error",
  },
  [ERROR_CODES.FORBIDDEN]: {
    status: status.FORBIDDEN,
    message: "Access forbidden",
  },
  [ERROR_CODES.NOT_ACCEPTABLE]: {
    status: status.NOT_ACCEPTABLE,
    message: "Not acceptable",
  },
};


// Function to handle general application errors
export const handleGeneralError = (error: any) => {
  if (error instanceof SyntaxError) {
    // Handling JSON parse errors, etc.
    throw new AppError(ERROR_CODES.BAD_REQUEST, "Syntax error in request");
  } else if (error.code === "ENOTFOUND") {
    // Handling network errors
    throw new AppError(
      ERROR_CODES.SERVICE_UNAVAILABLE,
      "Network error, service not found"
    );
  } else if (error.code === "ECONNREFUSED") {
    // Handling connection refused errors
    throw new AppError(ERROR_CODES.SERVICE_UNAVAILABLE, "Connection refused");
  } else if (error.code === "ETIMEDOUT") {
    // Handling timeout errors
    throw new AppError(ERROR_CODES.SERVICE_UNAVAILABLE, "Request timed out");
  } else {
    // General unexpected errors
    throw new AppError(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "Unexpected application error"
    );
  }
};
