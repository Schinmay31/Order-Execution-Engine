import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { getNamespace } from "cls-hooked";
import { HttpStatusCodes as StatusCodes } from "../utils/master.constants";
import { AppError } from "../utils/appError";

export function errorHandler(
  error: FastifyError | any,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const responseInterceptor = getNamespace("responseInterceptor");

  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "An unexpected error occurred";
  let errorList: any = null;

  // Custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode();
    message = error.message;
    errorList = error.getErrorList();
  }
  // Custom errorList object
  else if (error.errorList && error.errorList.status) {
    statusCode = error.errorList.status;
    message = error.errorList.message;
    errorList =
      error.errorList.errorList ||
      error.errorList.message ||
      null;
  }
  // Fastify built-in errors (Boom-like)
  else if (error.status) {
    statusCode = error.status;
    message = error.message;
    errorList = error.errorList || error.message || null;
  }
  // Fallback
  else {
    message = error.message || message;
    errorList = error;
  }

  console.error(error);

  reply.status(statusCode).send({
    error: {
      errorList,
      statusCode,
      status: StatusCodes[StatusCodes.INTERNAL_SERVER_ERROR as any],
      message,
      reqMethod: responseInterceptor?.get("reqMethod"),
      timeStamp: responseInterceptor?.get("timeStamp"),
      pathUrl: responseInterceptor?.get("pathUrl"),
      apiVersion: `[${responseInterceptor?.get("apiVersion")}]`,
    },
  });
}
