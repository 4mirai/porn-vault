import * as logger from "../logger";
import setupFunction from "../setup";
import { exists, writeFile, readFile } from "fs";
import { promisify } from "util";
import { Dictionary } from "../types/utility";
import YAML from "yaml";
import inquirer from "inquirer";

const existsAsync = promisify(exists);
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

function stringifyFormatted(obj: any) {
  return JSON.stringify(obj, null, 1);
}

interface IPlugin {
  path: string;
  args?: Dictionary<any>;
}

export interface IConfig {
  VIDEO_PATHS: string[];
  IMAGE_PATHS: string[];

  BULK_IMPORT_PATHS: string[];

  SCAN_ON_STARTUP: boolean;
  SCAN_INTERVAL: number;

  LIBRARY_PATH: string;

  FFMPEG_PATH: string;
  FFPROBE_PATH: string;

  GENERATE_THUMBNAILS: boolean;
  GENERATE_MULTIPLE_THUMBNAILS: boolean;
  GENERATE_PREVIEWS: boolean;
  THUMBNAIL_INTERVAL: number;

  PASSWORD: string | null;

  PORT: number;

  APPLY_SCENE_LABELS: boolean;
  APPLY_ACTOR_LABELS: boolean;
  APPLY_STUDIO_LABELS: boolean;

  /* USE_FUZZY_SEARCH: boolean;
  FUZZINESS: number; */

  READ_IMAGES_ON_IMPORT: boolean;
  REMOVE_DANGLING_FILE_REFERENCES: boolean;

  BACKUP_ON_STARTUP: boolean;
  MAX_BACKUP_AMOUNT: number;

  EXCLUDE_FILES: string[];

  CALCULATE_FILE_CHECKSUM: boolean;

  PLUGINS: Dictionary<IPlugin>;
  PLUGIN_EVENTS: Dictionary<string[]>;
}

export const defaultConfig: IConfig = {
  VIDEO_PATHS: [],
  IMAGE_PATHS: [],

  BULK_IMPORT_PATHS: [],

  SCAN_ON_STARTUP: false,
  SCAN_INTERVAL: 10800000,
  LIBRARY_PATH: process.cwd(),
  FFMPEG_PATH: "",
  FFPROBE_PATH: "",
  GENERATE_THUMBNAILS: true,
  GENERATE_MULTIPLE_THUMBNAILS: true,
  GENERATE_PREVIEWS: false,
  THUMBNAIL_INTERVAL: 120,
  PASSWORD: null,
  PORT: 3000,
  APPLY_SCENE_LABELS: true,
  APPLY_ACTOR_LABELS: true,
  APPLY_STUDIO_LABELS: true,
  /* USE_FUZZY_SEARCH: true,
  FUZZINESS: 0.25, */
  READ_IMAGES_ON_IMPORT: false,
  REMOVE_DANGLING_FILE_REFERENCES: false,
  BACKUP_ON_STARTUP: true,
  MAX_BACKUP_AMOUNT: 10,
  EXCLUDE_FILES: [],
  CALCULATE_FILE_CHECKSUM: false,
  PLUGINS: {},
  PLUGIN_EVENTS: {
    actorCreated: [],
    sceneCreated: []
  }
};

let config = JSON.parse(JSON.stringify(defaultConfig)) as IConfig;

export async function checkConfig() {
  if (await existsAsync("config.json")) {
    config = JSON.parse(await readFileAsync("config.json", "utf-8"));

    let defaultOverride = false;
    for (const key in defaultConfig) {
      if (config[key] === undefined) {
        config[key] = defaultConfig[key];
        defaultOverride = true;
      }
    }

    if (defaultOverride) {
      await writeFileAsync("config.json", stringifyFormatted(config), "utf-8");
    }
    return config;
  } else if (await existsAsync("config.yaml")) {
    config = YAML.parse(await readFileAsync("config.yaml", "utf-8"));

    let defaultOverride = false;
    for (const key in defaultConfig) {
      if (config[key] === undefined) {
        config[key] = defaultConfig[key];
        defaultOverride = true;
      }
    }

    if (defaultOverride) {
      await writeFileAsync("config.yaml", YAML.stringify(config), "utf-8");
    }
    return config;
  }

  const { yaml } = await inquirer.prompt([
    {
      type: "confirm",
      name: "yaml",
      message: "Use YAML (instead of JSON) for config file?",
      default: false
    }
  ]);

  config = await setupFunction();

  if (yaml) {
    await writeFileAsync("config.yaml", YAML.stringify(config), "utf-8");
    logger.warn("Created config.yaml. Please edit and restart.");
  } else {
    await writeFileAsync("config.json", stringifyFormatted(config), "utf-8");
    logger.warn("Created config.json. Please edit and restart.");
  }

  return process.exit(0);
}

export async function getConfig() {
  if (await existsAsync("config.json"))
    return JSON.parse(await readFileAsync("config.json", "utf-8")) as IConfig;
  else if (await existsAsync("config.yaml"))
    return YAML.parse(await readFileAsync("config.yaml", "utf-8")) as IConfig;
  return defaultConfig;
}
