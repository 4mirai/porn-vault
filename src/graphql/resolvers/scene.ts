import Scene from "../../types/scene";
import Image from "../../types/image";
import Studio from "../../types/studio";
import CustomField, { CustomFieldTarget } from "../../types/custom_field";
import SceneView from "../../types/watch";

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
  },
  async markers(scene: Scene) {
    return await Scene.getMarkers(scene);
  },
  async availableFields() {
    const fields = await CustomField.getAll();
    return fields.filter((field) =>
      field.target.includes(CustomFieldTarget.SCENES)
    );
  },
  async movies(scene: Scene) {
    return Scene.getMovies(scene);
  },
  async watches(scene: Scene) {
    return (await SceneView.getByScene(scene._id)).map((v) => v.date);
  },
};
