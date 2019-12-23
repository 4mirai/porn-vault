import Scene from "../../types/scene";
import Image from "../../types/image";
import Studio from "../../types/studio";

export default {
  async actors(scene: Scene) {
    return await Scene.getActors(scene);
  },
  async images(scene: Scene) {
    return await Image.getByScene(scene._id);
  },
  async labels(scene: Scene) {
    return await Scene.getLabels(scene);
  },
  async thumbnail(scene: Scene) {
    if (scene.thumbnail) return await Image.getById(scene.thumbnail);
    return null;
  },
  async preview(scene: Scene) {
    if (scene.preview) return await Image.getById(scene.preview);
    return null;
  },
  async studio(scene: Scene) {
    if (scene.studio) return Studio.getById(scene.studio);
    return null;
  }
};
