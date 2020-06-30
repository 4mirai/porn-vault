import debug from "debug";
import * as url from "url";
import express from "express";
import { getConfig } from "./config/index";
import { writeFileAsync } from "./fs/async";

if (process.env.NODE_ENV == "development") {
  debug.enable("vault:*");
} else if (!process.env.DEBUG) {
  debug.enable(
    "vault:success,vault:warn,vault:error,vault:message,vault:plugin"
  );
}

enum LogType {
  LOG = "log",
  WARN = "warn",
  ERROR = "error",
  SUCCESS = "success",
  HTTP = "http",
  MESSAGE = "message",
  SEARCH = "search",
  IZZY = "izzy",
  GIANNA = "gianna",
}

interface ILogData {
  type: LogType;
  text: string;
  date: number;
}

const logArray = [] as ILogData[];
export function getLog() {
  return logArray;
}

function createItem(type: LogType, text: string) {
  return {
    type,
    text,
    date: +new Date(),
  } as ILogData;
}

function appendToLog(item: ILogData) {
  // For some reason, when directly testing config/index.ts (example: in config/index.spec.ts)
  // this file cannot resolve config/index.ts and the imported module will be undefined
  // causing undefined.getConfig() to throw an error
  if (process.env.NODE_ENV !== "test") {
    const config = getConfig();
    if (config && logArray.length == config.MAX_LOG_SIZE) logArray.shift();
  }
  logArray.push(item);
}

export async function logToFile() {
  return writeFileAsync(
    `log-${new Date().toISOString()}`,
    JSON.stringify(logArray),
    "utf-8"
  );
}

function merge(...args: any[]) {
  return args
    .map((a) => {
      const str = JSON.stringify(a);
      if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1);
      return str;
    })
    .join("\n");
}

export const log = (...args: any) => {
  const text = merge(...args);
  debug("vault:log")(text);
  appendToLog(createItem(LogType.LOG, text));
};
export const success = (...args: any) => {
  const text = merge(...args);
  debug("vault:success")(text);
  appendToLog(createItem(LogType.SUCCESS, text));
};
export const http = (...args: any) => {
  const text = merge(...args);
  debug("vault:http")(text);
  appendToLog(createItem(LogType.HTTP, text));
};
export const warn = (...args: any) => {
  const text = merge(...args);
  debug("vault:warn")(text);
  appendToLog(createItem(LogType.WARN, text));
};
export const error = (...args: any) => {
  const text = merge(...args);
  debug("vault:error")(text);
  appendToLog(createItem(LogType.ERROR, text));
};
export const message = (...args: any) => {
  const text = merge(...args);
  debug("vault:message")(text);
  appendToLog(createItem(LogType.MESSAGE, text));
};
export const izzy = (...args: any) => {
  const text = merge(...args);
  debug("vault:izzy")(text);
  appendToLog(createItem(LogType.IZZY, text));
};
export const gianna = (...args: any) => {
  const text = merge(...args);
  debug("vault:gianna")(text);
  appendToLog(createItem(LogType.GIANNA, text));
};

export const httpLog = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  http(`${req.method} ${req.path}: ${new Date().toLocaleString()}`);
  next();
};
