import {
  exists,
  stat,
  unlink,
  readdir,
  readFile,
  writeFile,
  copyFile
} from "fs";
import { promisify } from "util";
import { join, extname } from "path";
import * as logger from "../logger/index";
import rimraf from "rimraf";

export const existsAsync = promisify(exists);
export const statAsync = promisify(stat);
export const unlinkAsync = promisify(unlink);
export const readdirAsync = promisify(readdir);
export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);
export const copyFileAsync = promisify(copyFile);
export const rimrafAsync = promisify(rimraf);

export async function walk(
  dir: string,
  exts = [] as string[],
  cb: (file: string) => Promise<void>
) {
  let folderStack = [] as string[];
  folderStack.push(dir);

  while (folderStack.length) {
    const top = folderStack.pop();
    if (!top) break;
    logger.log("Walking folder " + top + "...");
    const filesInDir = await readdirAsync(top);

    for (const file of filesInDir) {
      const path = join(top, file);
      const stat = await statAsync(path);

      if (stat.isDirectory()) {
        logger.log("Pushed folder " + path);
        folderStack.push(path);
      } else if (exts.includes(extname(file))) {
        logger.log("Found file " + file + "...");
        await cb(path);
      }
    }
  }
}
