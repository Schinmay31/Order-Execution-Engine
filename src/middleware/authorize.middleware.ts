// import { AppError } from "../utils/AppError";
// import jwt from "jsonwebtoken";
// import { IAuth } from "../types/auth.types";
// import { ERROR_CODES } from "../utils/master-constants";
// import { AUTHORIZE } from "../constants/auth.constants";
// import DOT_ENV from "../../config-env";
// import { FastifyRequest, FastifyReply } from "fastify";

// export function authorize(excludedPaths: IAuth[]) {
//   return async function (request: FastifyRequest, reply: FastifyReply) {
//     try {
//       const isExcluded = excludedPaths.some((ep) => {
//         return ep.method === request.method && ep.path.test(request.url);
//       });

//       if (isExcluded) {
//         return; // Skip auth
//       }

//       // Extract Bearer token
//       const token = request.headers.authorization?.split(" ")[1];
//       if (!token) {
//         throw new AppError(
//           ERROR_CODES.FORBIDDEN,
//           AUTHORIZE.PERMISSION_NOT_GRANTED
//         );
//       }

//       const JWT_SECRET_KEY = DOT_ENV.JWT_SECRET;
//       if (!JWT_SECRET_KEY) {
//         throw new AppError(
//           ERROR_CODES.INTERNAL_SERVER_ERROR,
//           AUTHORIZE.JWT_SECRET_KEY_NOT_FOUND
//         );
//       }

//       try {
//         const payload = jwt.verify(token, JWT_SECRET_KEY);

//         // Attach decoded user data to request (Fastify way)
//         (request as any).userData = payload;
//         return;
//       } catch {
//         throw new AppError(
//           ERROR_CODES.UNAUTHORIZED,
//           AUTHORIZE.SESSION_EXPIRED
//         );
//       }
//     } catch (err) {
//       // Fastify automatically sends error to error handler
//       throw err;
//     }
//   };
// }
