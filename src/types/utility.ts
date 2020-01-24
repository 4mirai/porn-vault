import { getConfig } from "../config/index";
import * as path from "path";

export interface Dictionary<T> {
  [key: string]: T;
}

export function isValidUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

export async function libraryPath(str: string) {
  return path.join(getConfig().LIBRARY_PATH, "library", str);
}

export function mapAsync<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>
): Promise<U[]> {
  return Promise.all(array.map(callbackfn));
}

export async function filterAsync<T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((_value, index) => filterMap[index]);
}

export function isRegExp(regStr: string) {
  try {
    new RegExp(regStr);
  } catch (e) {
    return false;
  }
  return true;
}
