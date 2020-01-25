import Actor from "../types/actor";
import { runPluginsSerial } from "../plugins";
import { mapAsync, isValidUrl, libraryPath } from "../types/utility";
import { extractLabels } from "../extractor";
import { getConfig } from "../config";
import { extname } from "path";
import { downloadFile } from "../ffmpeg-download";
import Image from "../types/image";
import * as database from "../database/index";
import * as logger from "../logger/index";

// This function has side effects
export async function onActorCreate(actor: Actor, actorLabels: string[]) {
  const config = getConfig();

  const pluginResult = await runPluginsSerial(config, "actorCreated", {
    actorName: actor.name,
    $createImage: async (url: string, name: string, thumbnail?: boolean) => {
      if (!isValidUrl(url)) throw new Error(`Invalid URL: ` + url);
      const img = new Image(name);
      if (thumbnail) img.name += " (thumbnail)";
      const ext = extname(url);
      const path = libraryPath(`images/${img._id}${ext}`);
      await downloadFile(url, path);
      img.path = path;
      await Image.setActors(img, [actor._id]);
      logger.log("Created image " + img._id);
      await database.insert(database.store.images, img);
      return img._id;
    }
  });

  if (
    typeof pluginResult.thumbnail == "string" &&
    pluginResult.thumbnail.startsWith("im_")
  )
    actor.thumbnail = pluginResult.thumbnail;

  if (typeof pluginResult.name === "string") actor.name = pluginResult.name;

  if (typeof pluginResult.bornOn === "number")
    actor.bornOn = new Date(pluginResult.bornOn).valueOf();

  if (pluginResult.aliases && Array.isArray(pluginResult.aliases)) {
    actor.aliases.push(...pluginResult.aliases);
    actor.aliases = [...new Set(actor.aliases)];
  }

  if (pluginResult.custom && typeof pluginResult.custom === "object")
    Object.assign(actor.customFields, pluginResult.custom);

  if (pluginResult.labels && Array.isArray(pluginResult.labels)) {
    const labelIds = (
      await mapAsync(pluginResult.labels, extractLabels)
    ).flat();
    await Actor.setLabels(actor, labelIds.concat(actorLabels));
  }

  return actor;
}
