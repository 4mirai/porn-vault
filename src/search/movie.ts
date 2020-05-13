import Movie from "../types/movie";
import Studio from "../types/studio";
import * as logger from "../logger";
import { Gianna } from "./internal/index";
import ora from "ora";
import { mapAsync } from "../types/utility";
import argv from "../args";
import extractQueryOptions from "../query_extractor";

const PAGE_SIZE = 24;

export let index!: Gianna.Index<IMovieSearchDoc>;

const FIELDS = ["name", "actorNames", "labelNames", "studioName"];

export interface IMovieSearchDoc {
  _id: string;
  addedOn: number;
  name: string;
  actors: string[];
  labels: string[];
  actorNames: string[];
  labelNames: string[];
  rating: number;
  bookmark: number | null;
  favorite: boolean;
  releaseDate: number | null;
  duration: number | null;
  studio: string | null;
  studioName: string | null;
  numScenes: number;
}

export async function createMovieSearchDoc(
  movie: Movie
): Promise<IMovieSearchDoc> {
  const labels = await Movie.getLabels(movie);
  const actors = await Movie.getActors(movie);
  const studio = movie.studio ? await Studio.getById(movie.studio) : null;
  const scenes = await Movie.getScenes(movie);

  return {
    _id: movie._id,
    addedOn: movie.addedOn,
    name: movie.name,
    labels: labels.map((l) => l._id),
    actors: actors.map((a) => a._id),
    actorNames: actors.map((a) => [a.name, ...a.aliases]).flat(),
    labelNames: labels.map((l) => [l.name, ...l.aliases]).flat(),
    studio: studio ? studio._id : null,
    studioName: studio ? studio.name : null,
    rating: await Movie.getRating(movie),
    bookmark: movie.bookmark,
    favorite: movie.favorite,
    duration: await Movie.calculateDuration(movie),
    releaseDate: movie.releaseDate,
    numScenes: scenes.length,
  };
}

async function addMovieSearchDocs(docs: IMovieSearchDoc[]) {
  logger.log(`Indexing ${docs.length} items...`);
  const timeNow = +new Date();
  const res = await index.index(docs, FIELDS);
  logger.log(`Gianna indexing done in ${(Date.now() - timeNow) / 1000}s`);
  return res;
}

export async function updateMovies(movies: Movie[]) {
  return index.update(await mapAsync(movies, createMovieSearchDoc), FIELDS);
}

export async function indexMovies(movies: Movie[]) {
  let docs = [] as IMovieSearchDoc[];
  let numItems = 0;
  for (const movie of movies) {
    docs.push(await createMovieSearchDoc(movie));

    if (docs.length == (argv["index-slice-size"] || 5000)) {
      await addMovieSearchDocs(docs);
      numItems += docs.length;
      docs = [];
    }
  }
  if (docs.length) {
    await addMovieSearchDocs(docs);
    numItems += docs.length;
  }
  docs = [];
  return numItems;
}

export async function buildMovieIndex() {
  index = await Gianna.createIndex("movies");

  const timeNow = +new Date();
  const loader = ora("Building movie index...").start();

  const res = await indexMovies(await Movie.getAll());

  loader.succeed(`Build done in ${(Date.now() - timeNow) / 1000}s.`);
  logger.log(`Index size: ${res} items`);

  return index;
}

export async function searchMovies(query: string, shuffleSeed = "default") {
  const options = extractQueryOptions(query);
  logger.log(`Searching scenes for '${options.query}'...`);

  let sort = undefined as Gianna.ISortOptions | undefined;
  let filter = {
    type: "AND",
    children: [],
  } as Gianna.IFilterTreeGrouping;

  if (options.durationMin) {
    filter.children.push({
      condition: {
        operation: ">",
        property: "duration",
        type: "number",
        value: options.durationMin - 1,
      },
    });
  }

  if (options.durationMax) {
    filter.children.push({
      condition: {
        operation: "<",
        property: "duration",
        type: "number",
        value: options.durationMax + 1,
      },
    });
  }

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

  if (options.actors.length) {
    filter.children.push({
      type: "AND",
      children: options.actors.map((labelId) => ({
        condition: {
          operation: "?",
          property: "actors",
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

  if (options.studios.length) {
    filter.children.push({
      type: "OR",
      children: options.exclude.map((studioId) => ({
        condition: {
          operation: "=",
          property: "studio",
          type: "string",
          value: studioId,
        },
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
        addedOn: "number",
        name: "string",
        rating: "number",
        bookmark: "number",
        releaseDate: "number",
        duration: "number",
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
