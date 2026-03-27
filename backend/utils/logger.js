const isDev = process.env.NODE_ENV === "development";

const format = (level, data) => {
  const base = {
    level,
    timestamp: new Date().toISOString(),
    service: "visionconnect-api",
  };
  return JSON.stringify({
    ...base,
    ...(typeof data === "string" ? { message: data } : data),
  });
};

const logger = {
  info: (data) => console.log(format("info", data)),
  warn: (data) => console.warn(format("warn", data)),
  error: (data) => console.error(format("error", data)),
  debug: (data) => {
    if (isDev) console.debug(format("debug", data));
  },
};

export default logger;
