import {
  actorCollection,
  imageCollection,
  labelCollection,
  movieCollection,
  sceneCollection,
  studioCollection,
} from "../../database/index";
import { getLength, isProcessing } from "../../queue/processing";
import Actor from "../../types/actor";
import CustomField from "../../types/custom_field";
import Image from "../../types/image";
import Label from "../../types/label";
import LabelledItem from "../../types/labelled_item";
import Movie from "../../types/movie";
import Scene from "../../types/scene";
import Studio from "../../types/studio";
import { filterAsync, mapAsync } from "../../types/utility";
import SceneView from "../../types/watch";
import { getActors, getUnwatchedActors } from "./search/actor";
import { getImages } from "./search/image";
import { getMovies } from "./search/movie";
import { getScenes } from "./search/scene";
import { getStudios } from "./search/studio";

export default {
  async getWatches(_: void, { min, max }: { min: number | null; max: number | null }) {
    return (await SceneView.getAll()).filter(
      (w) => w.date >= (min || 0) && w.date <= (max || 99999999999999)
    );
  },

  async getScenesWithoutStudios(_, { num }: { num: number }) {
    const numStudios = await studioCollection.count();
    if (numStudios == 0) return [];

    return (await Scene.getAll()).filter((s) => s.studio === null).slice(0, num || 12);
  },

  async getScenesWithoutLabels(_, { num }: { num: number }) {
    return (
      await mapAsync(await Scene.getAll(), async (scene) => ({
        scene,
        numLabels: (await Scene.getLabels(scene)).length,
      }))
    )
      .filter((i) => i.numLabels == 0)
      .map((i) => i.scene)
      .slice(0, num || 12);
  },

  async getActorsWithoutLabels(_, { num }: { num: number }) {
    return (
      await mapAsync(await Actor.getAll(), async (actor) => ({
        actor,
        numLabels: (await Actor.getLabels(actor)).length,
      }))
    )
      .filter((i) => i.numLabels == 0)
      .map((i) => i.actor)
      .slice(0, num || 12);
  },

  async getScenesWithoutActors(_, { num }: { num: number }) {
    return (
      await mapAsync(await Scene.getAll(), async (scene) => ({
        scene,
        numActors: (await Scene.getActors(scene)).length,
      }))
    )
      .filter((i) => i.numActors == 0)
      .map((i) => i.scene)
      .slice(0, num || 12);
  },

  async getActorsWithoutScenes(_, { num }: { num: number }) {
    return (
      await mapAsync(await Actor.getAll(), async (actor) => ({
        actor,
        numScenes: (await Scene.getByActor(actor._id)).length,
      }))
    )
      .filter((i) => i.numScenes == 0)
      .map((i) => i.actor)
      .slice(0, num || 12);
  },

  async topActors(_, { skip, take }: { skip: number; take: number }) {
    return await Actor.getTopActors(skip, take);
  },

  getUnwatchedActors,

  async getQueueInfo() {
    return {
      length: await getLength(),
      processing: isProcessing(),
    };
  },

  getStudios,
  getMovies,
  getActors,
  getScenes,
  getImages,

  async getImageById(_, { id }: { id: string }) {
    return await Image.getById(id);
  },

  async getSceneById(_, { id }: { id: string }) {
    return await Scene.getById(id);
  },

  async getActorById(_, { id }: { id: string }) {
    return await Actor.getById(id);
  },

  async getMovieById(_, { id }: { id: string }) {
    return await Movie.getById(id);
  },

  async getStudioById(_, { id }: { id: string }) {
    return await Studio.getById(id);
  },

  async getLabelById(_, { id }: { id: string }) {
    return await Label.getById(id);
  },
  async getCustomFields() {
    return await CustomField.getAll();
  },
  async getLabels(_, { type }: { type?: string | null }) {
    let labels = await Label.getAll();

    if (type) {
      labels = await filterAsync(labels, async (label) => {
        const items = await LabelledItem.getByLabel(label._id);
        return items.some((i) => i.type === type);
      });
    }

    return labels.sort((a, b) => a.name.localeCompare(b.name));
  },
  async numScenes() {
    return await sceneCollection.count();
  },
  async numActors() {
    return await actorCollection.count();
  },
  async numMovies() {
    return movieCollection.count();
  },
  async numLabels() {
    return labelCollection.count();
  },
  async numStudios() {
    return studioCollection.count();
  },
  async numImages() {
    return await imageCollection.count();
  },
  async actorGraph() {
    const actors = await Actor.getAll();

    const links = [] as {
      _id: string;
      from: string;
      to: string;
      title: string;
    }[];

    for (const actor of actors) {
      const collabs = await Actor.getCollabs(actor);

      for (const collab of collabs) {
        for (const other of collab.actors) {
          links.push({
            from: actor._id,
            to: other._id,
            title: collab.scene.name,
            _id: collab.scene._id,
          });
        }
      }
    }

    // TODO: Remove duplicates?

    return {
      actors,
      links: { items: links },
    };
  },
};
