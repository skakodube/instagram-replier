const dotenv = require("dotenv");
// const fs = require("fs");

// if (!fs.existsSync(".env")) {
//   fs.copyFile(".env.example", ".env.example", () => {});
//   fs.renameSync(".env.example", ".env");
// }

process.env.NODE_ENV = process.env.NODE_ENV || "development";

// const envFound = dotenv.config();
// if (envFound.error) {
//   throw new Error("⚠️  Couldn't find .env file  ⚠️");
// }

module.exports = {
  port: process.env.PORT || 3000,

  databaseURL: process.env.MONGODB_URI,
  databaseTestURL: process.env.MONGODB_URI_TEST,

  jwtSecret: process.env.JWT_SECRET,

  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },

  emails: {
    apiKey: process.env.SENDGRID_API_KEY,
    apiSender: process.env.SENDGRID_SENDER,
    verificationTemplate: process.env.SENDGRID_VERIFICATION_TEMPLATE,
    recoverTemplate: process.env.SENDGRID_RECOVER_TEMPLAE,
    noticeTemplate: process.env.SENDGRID_NOTICE_TEMPLATE,
  },

  mode: process.env.NODE_ENV || "development",
};
