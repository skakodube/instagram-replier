const app = require("./app");
const config = require("./config");

const logger = require("./api/loaders/logging");
require("./api/loaders/prod")(app);

app.listen(
  config.port,
  logger.info(`
  ####################################
  🛡️  Server listening on port: ${config.port} 🛡️
  ####################################
`)
);
