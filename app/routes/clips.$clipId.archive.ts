import { Effect } from "effect";
import { DBService } from "@/services/db-service";
import { layerLive } from "@/services/layer";
import type { Route } from "./+types/clips.$clipId.archive";

export const action = async (args: Route.ActionArgs) => {
  const { clipId } = args.params;

  return Effect.gen(function* () {
    const db = yield* DBService;
    yield* db.archiveClip(clipId);

    return { success: true };
  }).pipe(Effect.provide(layerLive), Effect.runPromise);
};
