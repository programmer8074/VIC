import mongoose from "mongoose";
import logger from "../utils/logger.js";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set in your .env file");
  }

  mongoose.connection.on("connected", () =>
    logger.info({ message: "MongoDB connected" }),
  );
  mongoose.connection.on("error", (err) =>
    logger.error({ message: "MongoDB connection error", err }),
  );
  mongoose.connection.on("disconnected", () =>
    logger.warn({ message: "MongoDB disconnected" }),
  );

  await mongoose.connect(uri);
};
