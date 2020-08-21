import axios from "axios";
import ProgressBar from "cli-progress";
import { createWriteStream, existsSync } from "fs";
import * as os from "os";
import { Stream } from "stream";

import * as logger from "./logger";
import { Dictionary } from "./types/utility";

const FFMpegVersions: Record<string, Record<string, string>> = {
  Linux: {
    ia32: "https://github.com/kribblo/node-ffmpeg-installer/raw/master/platforms/linux-ia32/ffmpeg",
    x64: "https://github.com/kribblo/node-ffmpeg-installer/raw/master/platforms/linux-x64/ffmpeg",
  },
  Windows_NT: {
    ia32:
      "https://github.com/kribblo/node-ffmpeg-installer/raw/master/platforms/win32-ia32/ffmpeg.exe",
    x64:
      "https://github.com/kribblo/node-ffmpeg-installer/raw/master/platforms/win32-x64/ffmpeg.exe",
  },
  Darwin: {
    x64: "https://github.com/kribblo/node-ffmpeg-installer/raw/master/platforms/darwin-x64/ffmpeg",
  },
};

const FFProbeVersions: Record<string, Record<string, string>> = {
  Linux: {
    ia32:
      "https://github.com/SavageCore/node-ffprobe-installer/raw/master/platforms/linux-ia32/ffprobe",
    x64:
      "https://github.com/SavageCore/node-ffprobe-installer/raw/master/platforms/linux-x64/ffprobe",
  },
  Windows_NT: {
    ia32:
      "https://github.com/SavageCore/node-ffprobe-installer/raw/master/platforms/win32-ia32/ffprobe.exe",
    x64:
      "https://github.com/SavageCore/node-ffprobe-installer/raw/master/platforms/win32-x64/ffprobe.exe",
  },
  Darwin: {
    x64:
      "https://github.com/SavageCore/node-ffprobe-installer/raw/master/platforms/darwin-x64/ffprobe",
  },
};

export function getFFMpegURL(): string {
  const sys = os.type();
  const arch = os.arch();

  return FFMpegVersions[sys][arch];
}

export function getFFProbeURL(): string {
  const sys = os.type();
  const arch = os.arch();

  return FFProbeVersions[sys][arch];
}

export async function downloadFile(url: string, file: string): Promise<void> {
  if (existsSync(file)) return;

  logger.message(`Downloading ${url}...`);

  const downloadBar = new ProgressBar.SingleBar({}, ProgressBar.Presets.legacy);
  downloadBar.start(100, 0);

  const response = await axios({
    url: url,
    method: "GET",
    responseType: "stream",
  });
  const stream = response.data as Stream;

  const writer = createWriteStream(file);

  const totalSize = parseInt((<Dictionary<string>>response.headers)["content-length"]);
  let loaded = 0;

  stream.on("data", (data: Buffer) => {
    loaded += Buffer.byteLength(data);
    const percent = ((loaded / totalSize) * 100).toFixed(0);
    downloadBar.update(+percent);
  });

  stream.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", (err: Error) => {
      logger.error(`Error while downloading ${url}`);
      reject(err);
    });
  });

  downloadBar.stop();
}
