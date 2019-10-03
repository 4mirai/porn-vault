import { database } from "../database";
import { generateHash } from "../hash";

export class ImageMeta {
  size: number | null = null;
}

export default class Image {
  id: string;
  name: string;
  path: string;
  scene: string | null = null;
  addedOn = +new Date();
  favorite: boolean = false;
  bookmark: boolean = false;
  rating: number = 0;
  customFields: any = {};
  labels: string[] = [];
  meta = new ImageMeta();
  actors: string[] = [];

  static filterLabel(label: string) {
    for (const image of Image.getAll()) {
      database.get('images')
        .find({ id: image.id })
        .assign({ labels: image.labels.filter(l => l != label) })
        .write();
    }
  }

  static getByScene(id: string): Image[] {
    return Image
      .getAll()
      .filter(image => image.scene == id)
  }

  static getByActor(id: string): Image[] {
    return Image
      .getAll()
      .filter(image => image.actors.includes(id))
  }

  static getById(id: string): Image | null {
    return Image
      .getAll()
      .find(image => image.id == id) || null;
  }

  static getAll(): Image[] {
    return database.get('images').value();
  }

  constructor(name: string, path: string, scene?: string) {
    this.id = generateHash();
    this.name = name.trim();
    this.path = path;
    if (scene)
      this.scene = scene;
  }
}