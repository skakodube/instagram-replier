const dotenv = require("dotenv");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,

  databaseURL: process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,

  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },

  emails: {
    apiKey: process.env.SENDGRID_API_KEY,
    apiSender: process.env.SENDGRID_SENDER,
  },

  mode: process.env.NODE_ENV || "development",
};
