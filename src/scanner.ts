import * as logger from "./logger";
import { checkImageFolders, checkVideoFolders } from "./queue/check";
import { tryStartProcessing } from "./queue/processing";

export let nextScanTimestamp = null as number | null;
export let isScanning = false;

export async function scanFolders(): Promise<void> {
  if (isScanning) return;

  isScanning = true;
  logger.message("Scanning folders...");
  await checkVideoFolders();
  logger.success("Scan done.");
  await checkImageFolders();
  isScanning = false;

  tryStartProcessing().catch((err: Error) => {
    logger.error("Couldn't start processing...");
    logger.error(err.message);
  });
}

export function startScanInterval(ms: number): void {
  function printNextScanDate(): void {
    const nextScanDate = new Date(Date.now() + ms);
    nextScanTimestamp = nextScanDate.valueOf();
    logger.message(`Next scan at ${nextScanDate.toLocaleString()}`);
  }
  printNextScanDate();
  setInterval(() => {
    scanFolders()
      .then(printNextScanDate)
      .catch((err: Error) => {
        logger.error(`Scan failed ${err.message}`);
      });
  }, ms);
}
