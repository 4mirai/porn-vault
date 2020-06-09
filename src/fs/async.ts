import { copyFile, readdir, readFile, stat, unlink, writeFile } from "fs";
import { extname, join, resolve } from "path";
import rimraf from "rimraf";
import { promisify } from "util";

import * as logger from "../logger";

export const statAsync = promisify(stat);
export const unlinkAsync = promisify(unlink);
export const readdirAsync = promisify(readdir);
export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);
export const copyFileAsync = promisify(copyFile);
export const rimrafAsync = promisify(rimraf);

const pathIsExcluded = (exclude: string[], path: string) =>
  exclude.some((regStr) => new RegExp(regStr, "i").test(path.toLowerCase()));

const validExtension = (exts: string[], path: string) => exts.includes(extname(path).toLowerCase());

export interface IWalkOptions {
  dir: string;
  extensions: string[];
  cb: (file: string) => void | Promise<void>;
  exclude: string[];
}

export async function walk(options: IWalkOptions): Promise<void> {
  const root = resolve(options.dir);

  const folderStack = [] as string[];
  folderStack.push(root);

  while (folderStack.length) {
    const top = folderStack.pop();
    if (!top) break;
    logger.log(`Walking folder ${top}`);
    const filesInDir = await readdirAsync(top);

    for (const file of filesInDir) {
      const path = join(top, file);
      if (pathIsExcluded(options.exclude, path)) continue;

      const stat = await statAsync(path);
      if (stat.isDirectory()) {
        logger.log("Pushed folder " + path);
        folderStack.push(path);
      } else if (validExtension(options.extensions, file)) {
        logger.log("Found file " + file);
        await options.cb(resolve(path));
      }
    }
  }
}
