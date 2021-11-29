const express = require("express");
const app = express();
const config = require("./config");

const logger = require("./api/loaders/logging");
require("./api/loaders/db")();
require("./api/loaders/router")(app);
require("./api/loaders/prod")(app);

try {
  app.listen(
    process.env.PORT,
    logger.info(`
  #####################################
  🛡️  Server listening on port: ${config.port} 🛡️
  #####################################
`)
  );
} catch (err) {
  console.log(err.stack);
}
