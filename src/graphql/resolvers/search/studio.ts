import { studioCollection } from "../../../database";
import { IStudioSearchQuery, searchStudios } from "../../../search/studio";
import Studio from "../../../types/studio";
import * as logger from "../../../utils/logger";

export async function getStudios(
  _: unknown,
  { query, seed }: { query: Partial<IStudioSearchQuery>; seed?: string }
): Promise<
  | {
      numItems: number;
      numPages: number;
      items: Studio[];
    }
  | undefined
> {
  try {
    const timeNow = +new Date();
    const result = await searchStudios(query, seed);

    logger.log(
      `Search results: ${result.max_items} hits found in ${(Date.now() - timeNow) / 1000}s`
    );

    const studios = await studioCollection.getBulk(result.items);

    logger.log(`Search done in ${(Date.now() - timeNow) / 1000}s.`);

    return {
      numItems: result.max_items,
      numPages: result.num_pages,
      items: studios.filter(Boolean),
    };
  } catch (error) {
    logger.error(error);
  }
}
