import { withDatabaseDump } from "@/services/dump-service";
import { Effect, Schema } from "effect";
import { DBService } from "@/services/db-service";
import { layerLive } from "@/services/layer";
import type { Route } from "./+types/clips.update";

const updateSceneSchema = Schema.Struct({
  clips: Schema.Array(
    Schema.Tuple(
      Schema.String,
      Schema.Struct({
        scene: Schema.String,
        profile: Schema.String,
        beatType: Schema.String,
      })
    )
  ),
});

export const action = async (args: Route.ActionArgs) => {
  const json = await args.request.json();

  return Effect.gen(function* () {
    const db = yield* DBService;
    const { clips } = yield* Schema.decodeUnknown(updateSceneSchema)(json);

    yield* Effect.forEach(clips, ([id, { scene, profile, beatType }]) => {
      return db.updateClip(id, {
        scene,
        profile,
        beatType,
      });
    });

    return { success: true };
  }).pipe(withDatabaseDump, Effect.provide(layerLive), Effect.runPromise);
};
