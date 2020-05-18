import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { type, arch } from "os";
import * as logger from "./logger";
import { existsAsync, unlinkAsync} from "./fs/async";
import Axios from "axios";
import { downloadFile } from "./ffmpeg-download";
import { chmodSync } from "fs";
import { getConfig } from "./config/index";

export let giannaProcess!: ChildProcessWithoutNullStreams;

export const giannaPath = type() == "Windows_NT" ? "gianna.exe" : "gianna";

export async function deleteGianna() {
  await unlinkAsync(giannaPath);
}

interface IGithubAsset {
  browser_download_url: string;
  name: string;
}

export async function giannaVersion() {
  try {
    const res = await Axios.get(`http://localhost:${getConfig().GIANNA_PORT}/`);
    return res.data.version as string;
  } catch (error) {
    return null;
  }
}

export async function resetGianna() {
  try {
    await Axios.delete(`http://localhost:${getConfig().GIANNA_PORT}/index`);
  } catch (error) {
    logger.error("Error while resetting gianna");
    logger.log(error.message);
    throw error;
  }
}

async function downloadGianna() {
  logger.log("Fetching Gianna releases...");
  const releaseUrl = `https://api.github.com/repos/boi123212321/gianna/releases/latest`;

  const releaseInfo = (await Axios.get(releaseUrl)).data;
  const releaseId = releaseInfo.id;

  const assetsUrl = `https://api.github.com/repos/boi123212321/gianna/releases/${releaseId}/assets`;

  const assets = (await Axios.get(assetsUrl)).data as IGithubAsset[];

  const downloadName = {
    Windows_NT: "gianna.exe",
    Linux: "gianna_linux",
    Darwin: "gianna_mac",
  }[type()] as string;

  if (arch() != "x64") {
    logger.error("Unsupported architecture " + arch());
    process.exit(1);
  }

  const asset = assets.find((as) => as.name == downloadName);

  if (!asset) {
    logger.error(
      "Gianna release not found: " + downloadName + " for " + type()
    );
    process.exit(1);
  }

  await downloadFile(asset.browser_download_url, giannaPath);
  logger.log("CHMOD Gianna...");
  chmodSync(giannaPath, "111");
}

export async function ensureGiannaExists() {
  if (await existsAsync(giannaPath)) {
    logger.log("Gianna binary found");
    return 0;
  } else {
    logger.message("Downloading latest Gianna (search engine) binary...");
    await downloadGianna();
    return 1;
  }
}

export function spawnGianna() {
  return new Promise((resolve, reject) => {
    logger.log("Spawning Gianna");

    const port = getConfig().GIANNA_PORT;

    giannaProcess = spawn("./" + giannaPath, ["--port", port.toString()]);
    let responded = false;
    giannaProcess.on("error", (err) => {
      reject(err);
    });
    giannaProcess.stdout.on("data", (data) => {
      if (!responded) {
        logger.log("Gianna ready on port " + port);
        responded = true;
        resolve();
      }
    });
    giannaProcess.stderr.on("data", (data) => {
      logger.gianna(data.toString());
    });
  });
}
