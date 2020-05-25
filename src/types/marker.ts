import { generateHash } from "../hash";
import Scene from "./scene";
import * as logger from "../logger";
import { mapAsync, libraryPath } from "./utility";
import Label from "./label";
import Image from "./image";
import * as path from "path";
import { singleScreenshot } from "../ffmpeg/screenshot";
import { imageCollection, markerCollection } from "../database";

export default class Marker {
  _id: string;
  name: string;
  addedOn = +new Date();
  favorite: boolean = false;
  bookmark: number | null = null;
  rating: number = 0;
  customFields: any = {};
  scene: string;
  time: number; // Time in scene in seconds
  thumbnail?: string | null = null;

  static async getAll() {
    return markerCollection.getAll();
  }

  static async checkIntegrity() {
    const allMarkers = await Marker.getAll();

    for (const marker of allMarkers) {
      const markerId = marker._id.startsWith("st_")
        ? marker._id
        : `st_${marker._id}`;

      if (!marker.thumbnail) {
        await this.createMarkerThumbnail(marker);
      }
    }
  }

  static async createMarkerThumbnail(marker: Marker) {
    const scene = await Scene.getById(marker.scene);
    if (!scene || !scene.path) return;

    logger.log("Creating thumbnail for marker " + marker._id);
    const image = new Image(`${marker.name} (thumbnail)`);
    const imagePath = path.join(libraryPath("thumbnails/"), image._id) + ".jpg";
    image.path = imagePath;
    image.scene = marker.scene;
    marker.thumbnail = image._id;

    const actors = (await Scene.getActors(scene)).map((l) => l._id);
    await Image.setActors(image, actors);

    const labels = (await Marker.getLabels(marker)).map((l) => l._id);
    await Image.setLabels(image, labels);

    await singleScreenshot(scene.path, imagePath, marker.time + 15);
    await imageCollection.upsert(image._id, image);
    await markerCollection.upsert(marker._id, marker);
  }

  static async setLabels(marker: Marker, labelIds: string[]) {
    return Label.setForItem(marker._id, labelIds, "marker");
  }

  static async getLabels(marker: Marker) {
    return Label.getForItem(marker._id);
  }

  constructor(name: string, scene: string, time: number) {
    this._id = "mk_" + generateHash();
    this.name = name;
    this.scene = scene;
    this.time = Math.round(time);
  }

  static async getByScene(sceneId: string) {
    return markerCollection.query("scene-index", sceneId);
  }

  static async getById(_id: string) {
    return markerCollection.get(_id);
  }

  static async remove(_id: string) {
    await markerCollection.remove(_id);
  }

  static async removeByScene(sceneId: string) {
    for (const marker of await Marker.getByScene(sceneId)) {
      await Marker.remove(marker._id);
    }
  }
}
