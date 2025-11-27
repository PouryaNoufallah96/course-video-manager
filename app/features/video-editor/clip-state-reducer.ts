import type { DB } from "@/db/schema";
import type { EffectReducer } from "use-effect-reducer";
import type { Brand } from "./utils";

export type DatabaseId = Brand<string, "DatabaseId">;
export type FrontendId = Brand<string, "FrontendId">;
export type FrontendInsertionPoint =
  | {
      type: "start";
    }
  | {
      type: "after-clip";
      frontendClipId: FrontendId;
    }
  | {
      type: "end";
    };

export type DatabaseInsertionPoint =
  | {
      type: "after-clip";
      databaseClipId: DatabaseId;
    }
  | {
      type: "start";
    };

export type ClipOnDatabase = {
  type: "on-database";
  frontendId: FrontendId;
  databaseId: DatabaseId;
  videoFilename: string;
  sourceStartTime: number; // Start time in source video (seconds)
  sourceEndTime: number; // End time in source video (seconds)
  text: string;
  transcribedAt: Date | null;
  scene: string | null;
  profile: string | null;
  insertionOrder: number | null;
};

export type ClipOptimisticallyAdded = {
  type: "optimistically-added";
  frontendId: FrontendId;
  scene: string;
  profile: string;
  /**
   * An integer, incremented each time a new optimistically added clip is added.
   * Used to determine which clips should be paired with which database clips,
   * and to handle the deletion of the latest inserted clip.
   */
  insertionOrder: number;
  /**
   * If true, when the optimistically added clip is replaced with the database clip,
   * the clip will be archived. Allows the user to delete the clip before it's transcribed.
   */
  shouldArchive?: boolean;
};

export const createFrontendId = (): FrontendId => {
  return crypto.randomUUID() as FrontendId;
};

export type Clip = ClipOnDatabase | ClipOptimisticallyAdded;

export namespace clipStateReducer {
  export type State = {
    clips: Clip[];
    clipIdsBeingTranscribed: Set<FrontendId>;
    insertionPoint: FrontendInsertionPoint;
    insertionOrder: number;
  };

  export type Action =
    | {
        type: "new-optimistic-clip-detected";
        scene: string;
        profile: string;
      }
    | {
        type: "new-database-clips";
        clips: DB.Clip[];
      }
    | {
        type: "clips-deleted";
        clipIds: FrontendId[];
      }
    | {
        type: "clips-transcribed";
        clips: {
          databaseId: DatabaseId;
          text: string;
        }[];
      }
    | {
        type: "set-insertion-point-after";
        clipId: FrontendId;
      }
    | {
        type: "set-insertion-point-before";
        clipId: FrontendId;
      }
    | {
        type: "delete-latest-inserted-clip";
      };

  export type Effect =
    | {
        type: "transcribe-clips";
        clipIds: DatabaseId[];
      }
    | {
        type: "archive-clips";
        clipIds: DatabaseId[];
      }
    | {
        type: "scroll-to-bottom";
      }
    | {
        type: "update-clips";
        clips: [DatabaseId, { scene: string; profile: string }][];
      };
}

export const clipStateReducer: EffectReducer<
  clipStateReducer.State,
  clipStateReducer.Action,
  clipStateReducer.Effect
> = (
  state: clipStateReducer.State,
  action: clipStateReducer.Action,
  exec
): clipStateReducer.State => {
  switch (action.type) {
    case "new-optimistic-clip-detected": {
      const newFrontendId = createFrontendId();
      const newClip: ClipOptimisticallyAdded = {
        type: "optimistically-added",
        frontendId: newFrontendId,
        scene: action.scene,
        profile: action.profile,
        insertionOrder: state.insertionOrder + 1,
      };

      let newInsertionPoint: FrontendInsertionPoint = state.insertionPoint;

      let newClips: Clip[];
      if (state.insertionPoint.type === "end") {
        // Append to end
        newClips = [...state.clips, newClip];
      } else if (state.insertionPoint.type === "start") {
        // Insert at start
        newClips = [newClip, ...state.clips];
        newInsertionPoint = {
          type: "after-clip",
          frontendClipId: newFrontendId,
        };
      } else {
        const targetClipId = state.insertionPoint.frontendClipId;
        // Insert at insertion point
        const insertionPointIndex = state.clips.findIndex(
          (c) => c.frontendId === targetClipId
        );
        if (insertionPointIndex === -1) {
          throw new Error("Target clip not found when inserting after");
        }
        newClips = [
          ...state.clips.slice(0, insertionPointIndex + 1),
          newClip,
          ...state.clips.slice(insertionPointIndex + 1),
        ];
        newInsertionPoint = {
          type: "after-clip",
          frontendClipId: newFrontendId,
        };
      }

      // TODO: Handle scrolling to the new clip
      exec({
        type: "scroll-to-bottom",
      });

      return {
        ...state,
        clips: newClips,
        insertionOrder: state.insertionOrder + 1,
        insertionPoint: newInsertionPoint,
      };
    }
    case "new-database-clips": {
      let shouldScrollToBottom = false;

      let newClipsState: (Clip | undefined)[] = [...state.clips];

      const clipsToArchive = new Set<DatabaseId>();
      const databaseClipIdsToTranscribe = new Set<DatabaseId>();
      const frontendClipIdsToTranscribe = new Set<FrontendId>();
      const clipsToUpdateScene = new Map<
        DatabaseId,
        { scene: string; profile: string }
      >();

      let newInsertionPoint: FrontendInsertionPoint = state.insertionPoint;

      const optimisticClipsSortedByInsertionOrder = newClipsState
        .filter((c) => c?.type === "optimistically-added")
        .sort((a, b) => {
          return a.insertionOrder! - b.insertionOrder!;
        });

      for (const databaseClip of action.clips) {
        const firstOfSortedClips =
          optimisticClipsSortedByInsertionOrder.shift();
        // Find the first optimistically added clip
        const index = newClipsState.findIndex(
          (c) =>
            c?.type === "optimistically-added" &&
            c.insertionOrder === firstOfSortedClips?.insertionOrder
        );

        // If there is a first optimistically added clip, we need to pair it with the database clip
        if (firstOfSortedClips) {
          const frontendClip = newClipsState[index];
          // If the optimistically added clip should be archived, archive the database clip
          if (
            frontendClip?.type === "optimistically-added" &&
            frontendClip?.shouldArchive
          ) {
            clipsToArchive.add(databaseClip.id);
            newClipsState[index] = undefined;
          } else if (frontendClip?.type === "optimistically-added") {
            const newDatabaseClip: ClipOnDatabase = {
              ...databaseClip,
              type: "on-database",
              frontendId: frontendClip.frontendId,
              databaseId: databaseClip.id,
              scene: frontendClip.scene,
              profile: frontendClip.profile,
              insertionOrder: frontendClip.insertionOrder,
            };
            newClipsState[index] = newDatabaseClip;
            clipsToUpdateScene.set(databaseClip.id, {
              scene: frontendClip.scene,
              profile: frontendClip.profile,
            });
            frontendClipIdsToTranscribe.add(frontendClip.frontendId);
            databaseClipIdsToTranscribe.add(databaseClip.id);
          }
        } else {
          const newFrontendId = createFrontendId();

          const newDatabaseClip: ClipOnDatabase = {
            type: "on-database",
            ...databaseClip,
            frontendId: newFrontendId,
            databaseId: databaseClip.id,
            insertionOrder: state.insertionOrder + 1,
          };

          const result = insertClip(
            newClipsState,
            newDatabaseClip,
            state.insertionPoint
          );

          newClipsState = result.clips;
          newInsertionPoint = result.insertionPoint;

          frontendClipIdsToTranscribe.add(newFrontendId);
          databaseClipIdsToTranscribe.add(databaseClip.id);

          shouldScrollToBottom = true;
        }
      }

      if (clipsToUpdateScene.size > 0) {
        exec({
          type: "update-clips",
          clips: Array.from(clipsToUpdateScene.entries()),
        });
      }

      if (shouldScrollToBottom) {
        exec({
          type: "scroll-to-bottom",
        });
      }

      if (clipsToArchive.size > 0) {
        exec({
          type: "archive-clips",
          clipIds: Array.from(clipsToArchive),
        });
      }

      if (databaseClipIdsToTranscribe.size > 0) {
        exec({
          type: "transcribe-clips",
          clipIds: Array.from(databaseClipIdsToTranscribe),
        });
      }

      return {
        ...state,
        clipIdsBeingTranscribed: new Set([
          ...Array.from(state.clipIdsBeingTranscribed),
          ...Array.from(frontendClipIdsToTranscribe),
        ]),
        clips: newClipsState.filter((c) => c !== undefined),
        insertionPoint: newInsertionPoint,
      };
    }
    case "clips-deleted": {
      const { clips, clipsToArchive, insertionPoint } = archiveClips(
        state.clips,
        action.clipIds,
        state.insertionPoint
      );

      if (clipsToArchive.size > 0) {
        exec({
          type: "archive-clips",
          clipIds: Array.from(clipsToArchive),
        });
      }
      return {
        ...state,
        clips,
        insertionPoint: insertionPoint,
      };
    }
    case "clips-transcribed": {
      const set = new Set([...state.clipIdsBeingTranscribed]);

      const textMap: Record<DatabaseId, string> = action.clips.reduce(
        (acc, clip) => {
          acc[clip.databaseId] = clip.text;
          return acc;
        },
        {} as Record<DatabaseId, string>
      );

      return {
        ...state,
        clips: state.clips.map((clip) => {
          if (clip.type === "on-database" && textMap[clip.databaseId]) {
            set.delete(clip.frontendId);
            return { ...clip, text: textMap[clip.databaseId]! };
          }
          return clip;
        }),
        clipIdsBeingTranscribed: set,
      };
    }
    case "set-insertion-point-after": {
      const clip = state.clips.find((c) => c.frontendId === action.clipId);
      if (!clip) {
        return state;
      }

      return {
        ...state,
        insertionPoint: {
          type: "after-clip",
          frontendClipId: action.clipId,
        },
      };
    }
    case "set-insertion-point-before": {
      const clip = state.clips.find((c) => c.frontendId === action.clipId);
      if (!clip) {
        return state;
      }

      // If inserting before, we need to find the previous clip's frontendId
      // to use as insertAfterId, OR use INSERTION_POINT_START if this is first clip
      const clipIndex = state.clips.findIndex(
        (c) => c.frontendId === action.clipId
      );

      let insertionPoint: FrontendInsertionPoint;
      if (clipIndex === 0) {
        // First clip - use magic constant
        insertionPoint = { type: "start" };
      } else {
        // Not first clip - use previous clip's frontendId
        const previousClip = state.clips[clipIndex - 1];

        if (previousClip) {
          insertionPoint = {
            type: "after-clip",
            frontendClipId: previousClip.frontendId,
          };
        } else {
          throw new Error("Previous clip not found when inserting before");
        }
      }

      return {
        ...state,
        insertionPoint,
      };
    }
    case "delete-latest-inserted-clip": {
      if (state.insertionPoint.type === "start") {
        return state;
      }

      if (state.insertionPoint.type === "end") {
        const lastClip = state.clips[state.clips.length - 1];

        if (!lastClip) {
          return state;
        }
        const { clips, clipsToArchive, insertionPoint } = archiveClips(
          state.clips,
          [lastClip.frontendId],
          state.insertionPoint
        );

        if (clipsToArchive.size > 0) {
          exec({
            type: "archive-clips",
            clipIds: Array.from(clipsToArchive),
          });
        }

        return {
          ...state,
          clips,
          insertionPoint,
        };
      }

      const clipIdToArchive = state.insertionPoint.frontendClipId;

      const archiveResult = archiveClips(
        state.clips,
        [clipIdToArchive],
        state.insertionPoint
      );

      if (archiveResult.clipsToArchive.size > 0) {
        exec({
          type: "archive-clips",
          clipIds: Array.from(archiveResult.clipsToArchive),
        });
      }

      return {
        ...state,
        clips: archiveResult.clips,
        insertionPoint: archiveResult.insertionPoint,
      };
    }
  }
  return state;
};

const insertClip = (
  clips: (Clip | undefined)[],
  newClip: Clip,
  insertionPoint: FrontendInsertionPoint
) => {
  let newInsertionPoint: FrontendInsertionPoint = insertionPoint;

  let newClips: (Clip | undefined)[];
  if (insertionPoint.type === "end") {
    // Append to end
    newClips = [...clips, newClip];
  } else if (insertionPoint.type === "start") {
    // Insert at start
    newClips = [newClip, ...clips];
    newInsertionPoint = {
      type: "after-clip",
      frontendClipId: newClip.frontendId,
    };
  } else {
    const targetClipId = insertionPoint.frontendClipId;
    // Insert at insertion point
    const insertionPointIndex = clips.findIndex(
      (c) => c?.frontendId === targetClipId
    );
    if (insertionPointIndex === -1) {
      throw new Error("Target clip not found when inserting after");
    }
    newClips = [
      ...clips.slice(0, insertionPointIndex + 1),
      newClip,
      ...clips.slice(insertionPointIndex + 1),
    ];
    newInsertionPoint = {
      type: "after-clip",
      frontendClipId: targetClipId,
    };
  }

  return {
    clips: newClips,
    insertionPoint: newInsertionPoint,
  };
};

type ArchiveClipMode =
  | {
      type: "move-insertion-point-to-previous-clip";
      originalClipIndex: number;
    }
  | {
      type: "do-nothing";
    };

const archiveClips = (
  allClips: Clip[],
  frontendIds: FrontendId[],
  insertionPoint: FrontendInsertionPoint
): {
  clips: Clip[];
  insertionPoint: FrontendInsertionPoint;
  clipsToArchive: Set<DatabaseId>;
} => {
  const clipsToArchive = new Set<DatabaseId>();

  let archiveClipMode: ArchiveClipMode;

  if (
    insertionPoint.type === "after-clip" &&
    frontendIds.includes(insertionPoint.frontendClipId)
  ) {
    const clipId = insertionPoint.frontendClipId;
    const prevClipIndex = allClips.findIndex((c) => c.frontendId === clipId);
    if (prevClipIndex === -1) {
      throw new Error("Previous clip not found when archiving");
    }
    archiveClipMode = {
      type: "move-insertion-point-to-previous-clip",
      originalClipIndex: prevClipIndex,
    };
  } else {
    archiveClipMode = {
      type: "do-nothing",
    };
  }

  const clips: (Clip | undefined)[] = [...allClips];
  for (const clipId of frontendIds) {
    const index = clips.findIndex((c) => c?.frontendId === clipId);
    if (index === -1) continue;

    const clipToReplace = clips[index]!;
    if (clipToReplace.type === "optimistically-added") {
      clipToReplace.shouldArchive = true;
    } else if (clipToReplace.type === "on-database") {
      clipsToArchive.add(clipToReplace.databaseId);
      clips[index] = undefined;
    }
  }

  // If the insertion point is after a clip, and that clip has been deleted,
  // we need to find a candidate for the insertion point
  if (archiveClipMode.type === "move-insertion-point-to-previous-clip") {
    const slicedClips = clips.slice(0, archiveClipMode.originalClipIndex);

    const previousNonUndefinedClip = slicedClips.findLast(
      (c) => c !== undefined
    );

    let newInsertionPoint: FrontendInsertionPoint;

    if (previousNonUndefinedClip) {
      newInsertionPoint = {
        type: "after-clip",
        frontendClipId: previousNonUndefinedClip.frontendId,
      };
    } else {
      newInsertionPoint = {
        type: "end",
      };
    }

    return {
      clips: clips.filter((c) => c !== undefined),
      insertionPoint: newInsertionPoint,
      clipsToArchive,
    };
  }

  return {
    clips: clips.filter((c) => c !== undefined),
    insertionPoint: insertionPoint,
    clipsToArchive: clipsToArchive,
  };
};
