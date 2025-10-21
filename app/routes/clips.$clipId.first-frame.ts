import { DBService } from "@/services/db-service";
import { Effect } from "effect";
import type { Route } from "./+types/clips.$clipId.first-frame";
import { layerLive } from "@/services/layer";
import { TotalTypeScriptCLIService } from "@/services/tt-cli-service";
import { createReadStream } from "fs";

export const loader = async (args: Route.LoaderArgs) => {
  const { clipId } = args.params;
  return Effect.gen(function* () {
    const db = yield* DBService;
    const clip = yield* db.getClipById(clipId);

    const inputVideo = clip.videoFilename;

    const seekTo = clip.sourceStartTime;

    const ttCliService = yield* TotalTypeScriptCLIService;

    const firstFramePath = yield* ttCliService.getFirstFrame(inputVideo, seekTo);

    const firstFrameReadStream = createReadStream(firstFramePath);

    return new Response(firstFrameReadStream as any, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  }).pipe(Effect.provide(layerLive), Effect.runPromise);
};
