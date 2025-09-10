import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  extractAudioFromVideoURL,
  getWaveformForTimeRange,
} from "@/services/video-editing";
import { useEffect, useReducer, useRef, useState } from "react";
import type { Route } from "./+types/videos.$videoId.edit";
import { DBService } from "@/services/db-service";
import { layerLive } from "@/services/layer";
import { Effect } from "effect";
import type { Clip, ClipState } from "@/features/video-editor/reducer";
import { VideoEditor } from "@/features/video-editor/video-editor";
import { Link } from "react-router";
import { ChevronLeftIcon, PlusIcon } from "lucide-react";
import { TitleSection } from "@/features/video-editor/title-section";

// Core data model - flat array of clips

export const loader = async (args: Route.LoaderArgs) => {
  const { videoId } = args.params;
  return Effect.gen(function* () {
    const db = yield* DBService;
    const video = yield* db.getVideoWithClipsById(videoId);
    return { video };
  }).pipe(Effect.provide(layerLive), Effect.runPromise);
};

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  const { video } = await args.serverLoader();

  if (video.clips.length === 0) {
    return { clipsWithWaveformData: [], video };
  }

  const audioBuffer = await extractAudioFromVideoURL(
    `/view-video?videoPath=${video.clips[0]!.videoFilename}`
  );

  const clipsWithWaveformData = video.clips.map((clip) => {
    const waveformDataForTimeRange = getWaveformForTimeRange(
      audioBuffer,
      clip.sourceStartTime,
      clip.sourceEndTime,
      200
    );
    return {
      ...clip,
      waveformDataForTimeRange,
    };
  });

  return { clipsWithWaveformData, video };
};

export default function Component(props: Route.ComponentProps) {
  const initialClips =
    "clipsWithWaveformData" in props.loaderData
      ? props.loaderData.clipsWithWaveformData
      : [];

  if (initialClips.length === 0) {
    return (
      <div className="p-6">
        <TitleSection
          videoPath={props.loaderData.video.path}
          lessonPath={props.loaderData.video.lesson.path}
          repoName={props.loaderData.video.lesson.section.repo.name}
        />
        <p className="text-sm text-muted-foreground mb-4">No clips found</p>
        <div className="flex gap-2 mb-4">
          <Button asChild variant="secondary">
            <Link
              to={`/?repoId=${props.loaderData.video.lesson.section.repo.id}#${props.loaderData.video.lesson.id}`}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Go Back
            </Link>
          </Button>
          <Button asChild variant="default">
            <Link to={`/videos/${props.loaderData.video.id}/write`}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Append From OBS
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <VideoEditor
      initialClips={initialClips}
      videoPath={props.loaderData.video.path}
      lessonPath={props.loaderData.video.lesson.path}
      repoName={props.loaderData.video.lesson.section.repo.name}
    />
  );
}
