import { Console, Effect } from "effect";
import { DBService } from "@/services/db-service";
import { layerLive } from "@/services/layer";
import type { Route } from "./+types/api.repos.$repoId.export-all";
import { TotalTypeScriptCLIService } from "@/services/tt-cli-service";
import { FINAL_VIDEO_PADDING } from "@/features/video-editor/constants";
import { withDatabaseDump } from "@/services/dump-service";

export const action = async (args: Route.ActionArgs) => {
  const { repoId } = args.params;

  return Effect.gen(function* () {
    const db = yield* DBService;
    const ttCliService = yield* TotalTypeScriptCLIService;

    const repoWithSections = yield* db.getRepoWithSectionsById(repoId);

    // Collect all videos with clips
    const videosToExport: Array<{
      id: string;
      clips: Array<{
        videoFilename: string;
        sourceStartTime: number;
        sourceEndTime: number;
      }>;
    }> = [];

    for (const section of repoWithSections.sections) {
      for (const lesson of section.lessons) {
        for (const video of lesson.videos) {
          if (video.clips.length > 0) {
            videosToExport.push({
              id: video.id,
              clips: video.clips,
            });
          }
        }
      }
    }

    // Export videos sequentially
    for (const video of videosToExport) {
      const result = yield* ttCliService.exportVideoClips({
        videoId: video.id,
        shortsDirectoryOutputName: undefined,
        clips: video.clips.map((clip, index, array) => {
          const isFinalClip = index === array.length - 1;
          return {
            inputVideo: clip.videoFilename,
            startTime: clip.sourceStartTime,
            duration:
              clip.sourceEndTime -
              clip.sourceStartTime +
              (isFinalClip ? FINAL_VIDEO_PADDING : 0),
          };
        }),
      });

      yield* Console.log(
        `Exported video ${video.id}: ${JSON.stringify(result)}`
      );
    }

    return { success: true, exportedCount: videosToExport.length };
  }).pipe(withDatabaseDump, Effect.provide(layerLive), Effect.runPromise);
};
