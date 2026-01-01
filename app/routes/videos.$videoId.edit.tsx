import type { DB } from "@/db/schema";
import type {
  Clip,
  ClipOnDatabase,
  DatabaseId,
  DatabaseInsertionPoint,
  FrontendId,
  FrontendInsertionPoint,
} from "@/features/video-editor/clip-state-reducer";
import {
  clipStateReducer,
  createFrontendId,
} from "@/features/video-editor/clip-state-reducer";
import type { BeatType } from "@/services/tt-cli-service";
import { useOBSConnector } from "@/features/video-editor/obs-connector";
import { VideoEditor } from "@/features/video-editor/video-editor";
import { DBService } from "@/services/db-service";
import { layerLive } from "@/services/layer";
import { FileSystem } from "@effect/platform";
import { Effect } from "effect";
import { useEffectReducer } from "use-effect-reducer";
import type { Route } from "./+types/videos.$videoId.edit";
import { useMemo } from "react";
import { INSERTION_POINT_ID } from "@/features/video-editor/constants";

// Core data model - flat array of clips

export const loader = async (args: Route.LoaderArgs) => {
  const { videoId } = args.params;
  return Effect.gen(function* () {
    const db = yield* DBService;
    const fs = yield* FileSystem.FileSystem;
    const video = yield* db.getVideoWithClipsById(videoId);

    // Check if lesson has explainer folder
    const lessonFullPath = `${video.lesson.section.repo.filePath}/${video.lesson.section.path}/${video.lesson.path}`;
    const explainerPath = `${lessonFullPath}/explainer`;
    const hasExplainerFolder = yield* fs.exists(explainerPath);

    return {
      video,
      clips: video.clips as DB.Clip[],
      waveformData: undefined,
      hasExplainerFolder,
      videoCount: video.lesson.videos.length,
    };
  }).pipe(Effect.provide(layerLive), Effect.runPromise);
};

export default function Component(props: Route.ComponentProps) {
  return <ComponentInner {...props} key={props.loaderData.video.id} />;
}

export const ComponentInner = (props: Route.ComponentProps) => {
  const [clipState, dispatch] = useEffectReducer(
    clipStateReducer,
    {
      clips: props.loaderData.clips.map(
        (clip): ClipOnDatabase => ({
          ...clip,
          type: "on-database",
          frontendId: createFrontendId(),
          databaseId: clip.id,
          insertionOrder: null,
          beatType: clip.beatType as BeatType,
        })
      ),
      clipIdsBeingTranscribed: new Set() satisfies Set<FrontendId>,
      insertionOrder: 0,
      insertionPoint: { type: "end" },
    },
    {
      "archive-clips": (_state, effect, _dispatch) => {
        fetch("/clips/archive", {
          method: "POST",
          body: JSON.stringify({ clipIds: effect.clipIds }),
        }).then((res) => {
          res.json();
        });
      },
      "transcribe-clips": (_state, effect, dispatch) => {
        fetch("/clips/transcribe", {
          method: "POST",
          body: JSON.stringify({ clipIds: effect.clipIds }),
        })
          .then((res) => res.json())
          .then((clips: DB.Clip[]) => {
            dispatch({
              type: "clips-transcribed",
              clips: clips.map((clip) => ({
                databaseId: clip.id,
                text: clip.text,
              })),
            });
          });
      },
      "scroll-to-insertion-point": () => {
        window.scrollTo({
          top:
            (document.getElementById(INSERTION_POINT_ID)?.offsetTop ?? 0) - 200,
          behavior: "smooth",
        });
      },
      "update-clips": (_state, effect, _dispatch) => {
        fetch("/clips/update", {
          method: "POST",
          body: JSON.stringify({ clips: effect.clips }),
        }).then((res) => {
          res.json();
        });
      },
      "update-beat": (_state, effect, _dispatch) => {
        fetch("/clips/update-beat", {
          method: "POST",
          body: JSON.stringify({
            clipId: effect.clipId,
            beatType: effect.beatType,
          }),
        }).then((res) => {
          res.json();
        });
      },
    }
  );

  const databaseInsertionPoint = useMemo(
    () => toDatabaseInsertionPoint(clipState.insertionPoint, clipState.clips),
    [clipState.insertionPoint, clipState.clips]
  );

  const obsConnector = useOBSConnector({
    videoId: props.loaderData.video.id,
    insertionPoint: databaseInsertionPoint,
    onNewDatabaseClips: (databaseClips) => {
      dispatch({ type: "new-database-clips", clips: databaseClips });
    },
    onNewClipOptimisticallyAdded: ({ scene, profile }) => {
      dispatch({ type: "new-optimistic-clip-detected", scene, profile });
    },
  });

  return (
    <VideoEditor
      onClipsRemoved={(clipIds) => {
        dispatch({ type: "clips-deleted", clipIds: clipIds });
      }}
      onClipsRetranscribe={(clipIds) => {
        const databaseIds = clipIds
          .map((frontendId) => {
            const clip = clipState.clips.find(
              (c) => c.frontendId === frontendId
            );
            return clip?.type === "on-database" ? clip.databaseId : null;
          })
          .filter((id): id is DatabaseId => id !== null);

        // This will trigger the transcribe-clips effect handler above
        fetch("/clips/transcribe", {
          method: "POST",
          body: JSON.stringify({ clipIds: databaseIds }),
        })
          .then((res) => res.json())
          .then((clips: DB.Clip[]) => {
            dispatch({
              type: "clips-transcribed",
              clips: clips.map((clip) => ({
                databaseId: clip.id,
                text: clip.text,
              })),
            });
          });
      }}
      insertionPoint={clipState.insertionPoint}
      onSetInsertionPoint={(mode, clipId) => {
        if (mode === "after") {
          dispatch({ type: "set-insertion-point-after", clipId });
        } else {
          dispatch({ type: "set-insertion-point-before", clipId });
        }
      }}
      onDeleteLatestInsertedClip={() => {
        dispatch({ type: "delete-latest-inserted-clip" });
      }}
      onToggleBeat={() => {
        dispatch({ type: "toggle-beat-at-insertion-point" });
      }}
      onToggleBeatForClip={(clipId) => {
        dispatch({ type: "toggle-beat-for-clip", clipId });
      }}
      obsConnectorState={obsConnector.state}
      clips={clipState.clips.filter((clip) => {
        if (clip.type === "optimistically-added" && clip.shouldArchive) {
          return false;
        }
        return true;
      })}
      repoId={props.loaderData.video.lesson.section.repo.id}
      lessonId={props.loaderData.video.lesson.id}
      videoPath={props.loaderData.video.path}
      lessonPath={props.loaderData.video.lesson.path}
      repoName={props.loaderData.video.lesson.section.repo.name}
      videoId={props.loaderData.video.id}
      liveMediaStream={obsConnector.mediaStream}
      speechDetectorState={obsConnector.speechDetectorState}
      clipIdsBeingTranscribed={clipState.clipIdsBeingTranscribed}
      hasExplainerFolder={props.loaderData.hasExplainerFolder}
      videoCount={props.loaderData.videoCount}
    />
  );
};

const toDatabaseInsertionPoint = (
  insertionPoint: FrontendInsertionPoint,
  clips: Clip[]
): DatabaseInsertionPoint => {
  if (insertionPoint.type === "start") {
    return { type: "start" };
  }
  if (insertionPoint.type === "after-clip") {
    const frontendClipIndex = clips.findIndex(
      (c) => c.frontendId === insertionPoint.frontendClipId
    );
    if (frontendClipIndex === -1) {
      throw new Error("Clip not found");
    }

    const previousDatabaseClipId = clips
      .slice(0, frontendClipIndex)
      .findLast((c) => c.type === "on-database")?.databaseId;

    if (!previousDatabaseClipId) {
      return { type: "start" };
    }

    return { type: "after-clip", databaseClipId: previousDatabaseClipId };
  }

  if (insertionPoint.type === "end") {
    const lastDatabaseClipId = clips.findLast(
      (c) => c.type === "on-database"
    )?.databaseId;
    if (!lastDatabaseClipId) {
      return { type: "start" };
    }
    return { type: "after-clip", databaseClipId: lastDatabaseClipId };
  }

  throw new Error("Invalid insertion point");
};
