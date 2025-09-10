import { Data, Effect, Schema } from "effect";
import { Command } from "@effect/platform";
import {
  NodeCommandExecutor,
  NodeContext,
  NodeRuntime,
} from "@effect/platform-node";

const getLatestOBSVideoClipsSchema = Schema.Array(
  Schema.Struct({
    inputVideo: Schema.String,
    startTime: Schema.Number,
    endTime: Schema.Number,
  })
);

class CouldNotParseJsonError extends Data.TaggedError(
  "CouldNotParseJsonError"
)<{
  cause: unknown;
  message: string;
}> {}

export class TotalTypeScriptCLIService extends Effect.Service<TotalTypeScriptCLIService>()(
  "TotalTypeScriptCLIService",
  {
    effect: Effect.gen(function* () {
      const getLatestOBSVideoClips = Effect.fn("getLatestOBSVideoClips")(
        function* () {
          const command = Command.make("tt", "get-clips-from-latest-video");

          const result = yield* Command.string(command);

          const parseResult = yield* Effect.try({
            try: () => JSON.parse(result.trim()) as unknown,
            catch: (e) =>
              new CouldNotParseJsonError({
                cause: e,
                message: `Could not parse JSON from get-clips-from-latest-video command`,
              }),
          });

          return yield* Schema.decodeUnknown(getLatestOBSVideoClipsSchema)(
            parseResult
          );
        }
      );

      return {
        getLatestOBSVideoClips,
      };
    }),
    dependencies: [NodeContext.layer],
  }
) {}
