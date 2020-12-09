const express = require("express");
const error = require("../middleware/error");
const cors = require("cors");
const { errors: joiError } = require("celebrate");
const auth = require("../routes/auth");
const user = require("../routes/user");
const bot = require("../routes/bot");

module.exports = function (app) {
  app.get("/status", (req, res) => {
    res.status(200).end();
  });
  app.head("/status", (req, res) => {
    res.status(200).end();
  });

  // app.use(cors);
  app.use(express.json());
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });
  app.use("/auth", auth);
  app.use("/user", user);
  app.use("/bot", bot);
  app.use(joiError());
  app.use(error);
};
