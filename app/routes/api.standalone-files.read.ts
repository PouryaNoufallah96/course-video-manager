import { Console, Effect, Schema } from "effect";
import { FileSystem } from "@effect/platform";
import type { Route } from "./+types/api.standalone-files.read";
import { DBService } from "@/services/db-service";
import { layerLive } from "@/services/layer";
import { getStandaloneVideoFilePath } from "@/services/standalone-video-files";
import { data } from "react-router";

const readFileSchema = Schema.Struct({
  videoId: Schema.String,
  filename: Schema.String,
});

export const loader = async (args: Route.LoaderArgs) => {
  const url = new URL(args.request.url);
  const videoId = url.searchParams.get("videoId");
  const filename = url.searchParams.get("filename");

  return Effect.gen(function* () {
    const parsed = yield* Schema.decodeUnknown(readFileSchema)({
      videoId,
      filename,
    });

    const db = yield* DBService;
    const fs = yield* FileSystem.FileSystem;

    // Validate video exists and is a standalone video
    const video = yield* db.getVideoById(parsed.videoId);
    if (video.lessonId !== null) {
      return yield* Effect.die(
        data("Cannot read files from lesson-connected videos", { status: 400 })
      );
    }

    // Construct file path
    const filePath = getStandaloneVideoFilePath(
      parsed.videoId,
      parsed.filename
    );

    // Check if file exists
    const fileExists = yield* fs.exists(filePath);
    if (!fileExists) {
      return yield* Effect.die(data("File not found", { status: 404 }));
    }

    // Read file content
    const content = yield* fs.readFileString(filePath);

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }).pipe(
    Effect.tapErrorCause((e) => Console.dir(e, { depth: null })),
    Effect.catchTag("ParseError", () => {
      return Effect.die(data("Invalid request", { status: 400 }));
    }),
    Effect.catchTag("NotFoundError", () => {
      return Effect.die(data("Video not found", { status: 404 }));
    }),
    Effect.catchAll(() => {
      return Effect.die(data("Internal server error", { status: 500 }));
    }),
    Effect.provide(layerLive),
    Effect.runPromise
  );
};
