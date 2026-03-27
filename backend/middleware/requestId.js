import { v4 as uuidv4 } from "uuid";

const requestIdMiddleware = (req, res, next) => {
  req.requestId = req.headers["x-request-id"] || uuidv4();
  res.setHeader("X-Request-ID", req.requestId);
  next();
};

export default requestIdMiddleware;
