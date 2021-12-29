const express = require('express');
const app = express();

require('./api/loaders/db')();
require('./api/loaders/router')(app);

module.exports = app;
