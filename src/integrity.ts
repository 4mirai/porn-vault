import { existsAsync } from "./fs/async";
import Scene from "./types/scene";
import Image from "./types/image";
import * as logger from "./logger";
import { getConfig } from "./config/index";
import fs from "fs";
import readline from "readline";
import { imageCollection, sceneCollection } from "./database/index";

export function bookmarksToTimestamp(file: string) {
  if (!fs.existsSync(file)) return;

  let lines = [] as string[];
  let modified = false;

  logger.log("Replacing bookmarks with timestamps in " + file);

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(file),
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", (line) => {
      const item = JSON.parse(line);
      if (item.bookmark !== undefined) {
        if (typeof item.bookmark == "boolean") {
          if (item.bookmark) item.bookmark = item.addedOn;
          else item.bookmark = null;
          modified = true;
        }
      }
      /* else {
        logger.log("Bookmarks already timestamp... aborting");
        return rl.close();
      }*/
      lines.push(JSON.stringify(item));
    });

    rl.on("close", () => {
      if (modified) {
        fs.unlinkSync(file);
        for (const line of lines) {
          fs.appendFileSync(file, line + "\n");
        }
      }
      resolve();
    });
  });
}
