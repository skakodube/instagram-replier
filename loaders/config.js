const dotenv = require("dotenv");

module.exports = function () {
  dotenv.config({ path: "./config/config.env" });
};
