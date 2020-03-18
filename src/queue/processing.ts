export interface ISceneProcessingItem {
  _id: string;
}

import * as database from "../database/index";

function getStore() {
  return database.store.processing;
}

export function removeSceneFromQueue(_id: string) {
  return database.remove(getStore(), { _id });
}

export function getLength(): Promise<number> {
  return database.count(getStore(), {});
}

export function getHead(): Promise<{ _id: string } | null> {
  return new Promise((resolve, reject) => {
    getStore()
      .find({})
      .limit(1)
      .exec(function(err, docs) {
        if (err) return reject(err);
        resolve(docs[0] || null);
      });
  });
}

export function enqueueScene(_id: string) {
  return database.insert(getStore(), { _id });
}
