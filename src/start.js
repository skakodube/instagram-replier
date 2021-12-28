const app = require("./app");
const config = require("./config");

const logger = require("./api/loaders/logging");
require("./api/loaders/prod")(app);

console.log(process.env);

app.listen(
  process.env.PORT || config.port,
  "0.0.0.0",
  logger.info(`
  ####################################
  🛡️  Server listening on port: ${config.port} 🛡️
  ####################################
`)
);
