import express from "express";
import { getConfig } from "./config";
const sha = require("js-sha512").sha512;
import * as logger from "./logger/index";
import pug from "pug";

export async function checkPassword(
  req: express.Request,
  res: express.Response
) {
  if (!req.query.password) return res.sendStatus(400);

  const config = await getConfig();

  if (!config.PASSWORD || sha(req.query.password) == config.PASSWORD) {
    return res.json("");
  }

  res.sendStatus(401);
}

export async function passwordHandler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const config = await getConfig();
  if (!config.PASSWORD) return next();

  if (req.headers["x-pass"] && sha(req.headers["x-pass"]) == config.PASSWORD) {
    logger.log("Auth OK");
    return next();
  }

  if (req.query.password && sha(req.query.password) == config.PASSWORD) {
    logger.log("Auth OK");
    return next();
  }

  try {
    return res.status(401).send(pug.renderFile("./views/signin.pug", {}));
  } catch (err) {
    console.error(err);
    return;
  }
}
