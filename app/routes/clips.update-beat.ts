import { withDatabaseDump } from "@/services/dump-service";
import { Effect, Schema } from "effect";
import { DBService } from "@/services/db-service";
import { layerLive } from "@/services/layer";
import type { Route } from "./+types/clips.update-beat";

const updateBeatSchema = Schema.Struct({
  clipId: Schema.String,
  beatType: Schema.String,
});

export const action = async (args: Route.ActionArgs) => {
  const json = await args.request.json();

  return Effect.gen(function* () {
    const db = yield* DBService;
    const { clipId, beatType } = yield* Schema.decodeUnknown(updateBeatSchema)(
      json
    );

    yield* db.updateClip(clipId, {
      beatType,
    });

    return { success: true };
  }).pipe(withDatabaseDump, Effect.provide(layerLive), Effect.runPromise);
};
