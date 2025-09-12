import { withDatabaseDump } from "@/services/dump-service";
import type { Route } from "./+types/videos.$videoId.append-from-obs";
import { DBService } from "@/services/db-service";
import { layerLive } from "@/services/layer";
import { TotalTypeScriptCLIService } from "@/services/tt-cli-service";
import { Effect, Schema } from "effect";
import path from "node:path";

const appendFromOBSSchema = Schema.Struct({
  filePath: Schema.String.pipe(Schema.optional),
});

function windowsToWSL(windowsPath: string) {
  // Convert C:\Users\... to /mnt/c/Users/...
  const drive = windowsPath.charAt(0).toLowerCase();
  const pathWithoutDrive = windowsPath.slice(3); // Remove "C:\"

  // Convert backslashes to forward slashes
  const unixPath = pathWithoutDrive.replace(/\\/g, "/");

  return `/mnt/${drive}/${unixPath}`;
}

export const action = async (args: Route.ActionArgs) => {
  const { videoId } = args.params;
  const json = await args.request.json();

  return Effect.gen(function* () {
    const result = yield* Schema.decodeUnknown(appendFromOBSSchema)(json);

    const resolvedFilePath = result.filePath
      ? windowsToWSL(result.filePath)
      : undefined;

    const db = yield* DBService;

    const ttCliService = yield* TotalTypeScriptCLIService;

    yield* db.getVideoById(videoId);

    const latestOBSVideoClips = yield* ttCliService.getLatestOBSVideoClips({
      filePath: resolvedFilePath,
    });

    if (latestOBSVideoClips.clips.length === 0) {
      return [];
    }

    const clips = yield* db.appendClips(videoId, latestOBSVideoClips.clips);

    return clips;
  }).pipe(withDatabaseDump, Effect.provide(layerLive), Effect.runPromise);
};
