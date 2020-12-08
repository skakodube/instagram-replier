const express = require("express");
const app = express();

require("./loaders/config")();
const logger = require("./loaders/logging");
require("./loaders/db")();
require("./loaders/router")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, logger.info(`Listening on port ${PORT}...`));
