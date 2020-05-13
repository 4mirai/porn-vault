import Actor from "../types/actor";
import Scene from "../types/scene";
import * as logger from "../logger";
import ora from "ora";
import { Gianna } from "./internal/index";
import Axios from "axios";
import argv from "../args";
import { mapAsync } from "../types/utility";
import extractQueryOptions from "../query_extractor";

const PAGE_SIZE = 24;

export let index!: Gianna.Index<IActorSearchDoc>;

const FIELDS = ["name", "aliases", "labelNames"];

export interface IActorSearchDoc {
  _id: string;
  addedOn: number;
  name: string;
  aliases: string[];
  labels: string[];
  labelNames: string[];
  rating: number;
  score: number;
  bookmark: number | null;
  favorite: boolean;
  numViews: number;
  bornOn: number | null;
  age: number | null;
  numScenes: number;
}

export async function createActorSearchDoc(
  actor: Actor
): Promise<IActorSearchDoc> {
  const labels = await Actor.getLabels(actor);

  const numViews = (await Actor.getWatches(actor)).length;
  const numScenes = (await Scene.getByActor(actor._id)).length;

  return {
    _id: actor._id,
    addedOn: actor.addedOn,
    name: actor.name,
    aliases: actor.aliases,
    labels: labels.map((l) => l._id),
    labelNames: labels.map((l) => [l.name, ...l.aliases]).flat(),
    score: Actor.calculateScore(actor, numViews, numScenes),
    rating: actor.rating,
    bookmark: actor.bookmark,
    favorite: actor.favorite,
    numViews,
    bornOn: actor.bornOn,
    numScenes,
    age: Actor.getAge(actor),
  };
}

export async function clearActorIndex() {
  try {
    await Axios.delete("http://localhost:8000/index/actors");
  } catch (error) {
    logger.error("Error while resetting gianna actors");
    logger.log(error.message);
    throw error;
  }
}

export async function updateActors(scenes: Actor[]) {
  return index.update(await mapAsync(scenes, createActorSearchDoc), FIELDS);
}

export async function indexActors(scenes: Actor[]) {
  let docs = [] as IActorSearchDoc[];
  let numItems = 0;
  for (const scene of scenes) {
    docs.push(await createActorSearchDoc(scene));

    if (docs.length == (argv["index-slice-size"] || 5000)) {
      await addActorSearchDocs(docs);
      numItems += docs.length;
      docs = [];
    }
  }
  if (docs.length) {
    await addActorSearchDocs(docs);
    numItems += docs.length;
  }
  docs = [];
  return numItems;
}

export async function addActorSearchDocs(docs: IActorSearchDoc[]) {
  logger.log(`Indexing ${docs.length} items...`);
  const timeNow = +new Date();
  const res = await index.index(docs, FIELDS);
  logger.log(`Gianna indexing done in ${(Date.now() - timeNow) / 1000}s`);
  return res;
}

export async function buildActorIndex() {
  index = await Gianna.createIndex("actors");

  const timeNow = +new Date();
  const loader = ora("Building actor index...").start();

  const res = await indexActors(await Actor.getAll());

  loader.succeed(`Build done in ${(Date.now() - timeNow) / 1000}s.`);
  logger.log(`Index size: ${res} items`);

  return index;
}

export async function searchActors(query: string, shuffleSeed = "default") {
  const options = extractQueryOptions(query);
  logger.log(`Searching actors for '${options.query}'...`);

  let sort = undefined as Gianna.ISortOptions | undefined;
  let filter = {
    type: "AND",
    children: [],
  } as Gianna.IFilterTreeGrouping;

  if (options.favorite) {
    filter.children.push({
      condition: {
        operation: "=",
        property: "favorite",
        type: "boolean",
        value: true,
      },
    });
  }

  if (options.bookmark) {
    filter.children.push({
      condition: {
        operation: ">",
        property: "bookmark",
        type: "number",
        value: 0,
      },
    });
  }

  if (options.rating) {
    filter.children.push({
      condition: {
        operation: ">",
        property: "rating",
        type: "number",
        value: options.rating - 1,
      },
    });
  }

  if (options.include.length) {
    filter.children.push({
      type: "AND",
      children: options.include.map((labelId) => ({
        condition: {
          operation: "?",
          property: "labels",
          type: "array",
          value: labelId,
        },
      })),
    });
  }

  if (options.exclude.length) {
    filter.children.push({
      type: "AND",
      children: options.exclude.map((labelId) => ({
        type: "NOT",
        children: [
          {
            condition: {
              operation: "?",
              property: "labels",
              type: "array",
              value: labelId,
            },
          },
        ],
      })),
    });
  }

  if (options.sortBy) {
    if (options.sortBy === "$shuffle") {
      sort = {
        sort_by: "$shuffle",
        sort_asc: false,
        sort_type: shuffleSeed,
      };
    } else {
      const sortType = {
        bornOn: "number",
        addedOn: "number",
        name: "string",
        rating: "number",
        bookmark: "number",
        numScenes: "number",
        numViews: "number",
      }[options.sortBy];
      sort = {
        sort_by: options.sortBy,
        sort_asc: options.sortDir === "asc",
        sort_type: sortType,
      };
    }
  }

  return index.search({
    query: options.query,
    skip: options.skip || options.page * 24,
    take: options.take || options.take || PAGE_SIZE,
    sort,
    filter,
  });
}
