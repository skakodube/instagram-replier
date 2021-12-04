const winston = require("winston");
require("express-async-errors");
const config = require("../../config");

//if test is running remove db logger

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

const transports = [
  new winston.transports.File({
    filename: "combined.log",
    level: config.logLevels,
    handleExceptions: true,
    handleRejections: true,
  }),
  new winston.transports.File({
    filename: "error.log",
    level: "error",
    handleExceptions: true,
    handleRejections: true,
  }),
];

//if test is running disable logging to db
if (typeof jest == "undefined") {
  require("winston-mongodb");
  transports.push(
    new winston.transports.MongoDB({
      db: config.databaseURL,
      options: { useUnifiedTopology: true },
      level: "error",
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

const logger = winston.createLogger({
  colorize: true,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

if (config.mode !== "production") {
  logger.add(
    new winston.transports.Console({
      level: "silly",
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
