const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");

const logLevels = {
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "green",
    sql: "blue",
    debug: "gray",
  },
};
winston.addColors(logLevels);

const logger = winston.createLogger({
  colorize: true,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "combined.log",
      handleExceptions: true,
      handleRejections: true,
    }),
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      options: { useUnifiedTopology: true },
      level: "error",
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.printf(
          (e) => `[winston] ${e.timestamp} | ${e.stack || e.message}`
        ),
        winston.format.colorize({ all: true })
      ),
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

module.exports = logger;
