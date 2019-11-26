import Studio from "../../types/studio";
import Image from "../../types/image";
import Scene from "../../types/scene";

export default {
  thumbnail(studio: Studio) {
    if (studio.thumbnail) return Image.getById(studio.thumbnail);
    return null;
  },

  scenes(studio: Studio) {
    return Studio.getScenes(studio);
  },

  actors(studio: Studio) {
    return Studio.getActors(studio);
  },

  labels(studio: Studio) {
    return Studio.getLabels(studio);
  },

  movies(studio: Studio) {
    return Studio.getMovies(studio);
  },

  async rating(studio: Studio) {
    const scenesWithScore = (await Studio.getScenes(studio)).filter(
      scene => !!scene.rating
    );

    if (!scenesWithScore.length) return null;

    return Math.round(
      scenesWithScore.reduce((rating, scene) => rating + scene.rating, 0) /
        scenesWithScore.length
    );
  },

  async numScenes(studio: Studio) {
    return (await Scene.getByStudio(studio._id)).length;
  }
};
