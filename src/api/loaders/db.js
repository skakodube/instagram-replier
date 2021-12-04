const mongoose = require("mongoose");
const logger = require("./logging");
const config = require("../../config");
let databaseURL = config.databaseURL;

//if test is running use test db
if (typeof jest !== "undefined") {
  databaseURL = config.databaseTestURL;
}

module.exports = async function () {
  try {
    const conn = await mongoose.connect(databaseURL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    logger.info(`✌️ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`⚠️ Failed connect to MongoDB: ${error} ⚠️`);
  }
};
