const mongoose = require("mongoose");
const logger = require("./logging");
const config = require("../../config");

module.exports = async function () {
  try {
    const conn = await mongoose.connect(config.databaseURL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    logger.info(`✌️ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`⚠️ Failed connect to MongoDB: ${error} ⚠️`);
  }
};
