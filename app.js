const express = require("express");
const app = express();

require("./src/loaders/config")();
const logger = require("./src/loaders/logging");
require("./src/loaders/db")();
require("./src/loaders/router")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, logger.info(`Listening on port ${PORT}...`));
