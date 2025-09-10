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
import type {
  Clip,
  ClipState,
  ClipWithWaveformData,
} from "@/features/video-editor/reducer";
import { VideoEditor } from "@/features/video-editor/video-editor";
import { Link, useFetcher } from "react-router";
import { ChevronLeftIcon, Loader2, PlusIcon } from "lucide-react";
import { TitleSection } from "@/features/video-editor/title-section";

// Core data model - flat array of clips

export const loader = async (args: Route.LoaderArgs) => {
  const { videoId } = args.params;
  return Effect.gen(function* () {
    const db = yield* DBService;
    const video = yield* db.getVideoWithClipsById(videoId);
    const clips: ClipWithWaveformData[] = video.clips.map((clip) => {
      return { ...clip, waveformData: undefined };
    });
    return { video, clips };
  }).pipe(Effect.provide(layerLive), Effect.runPromise);
};

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
  const { video } = await args.serverLoader();

  if (video.clips.length === 0) {
    return { clips: [], video };
  }

  const audioBuffer = await extractAudioFromVideoURL(
    `/view-video?videoPath=${video.clips[0]!.videoFilename}`
  );

  const clips: ClipWithWaveformData[] = video.clips.map((clip) => {
    const waveformData = getWaveformForTimeRange(
      audioBuffer,
      clip.sourceStartTime,
      clip.sourceEndTime,
      200
    );
    return {
      ...clip,
      waveformData,
    };
  });

  return { clips, video };
};

export default function Component(props: Route.ComponentProps) {
  const appendFromOBSFetcher = useFetcher();

  if (props.loaderData.clips.length === 0) {
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
          <appendFromOBSFetcher.Form
            method="post"
            action={`/videos/${props.loaderData.video.id}/append-from-obs`}
          >
            <Button variant="default">
              {appendFromOBSFetcher.state === "submitting" ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <PlusIcon className="w-4 h-4 mr-1" />
              )}
              Append From OBS
            </Button>
          </appendFromOBSFetcher.Form>
        </div>
      </div>
    );
  }

  return (
    <VideoEditor
      initialClips={props.loaderData.clips}
      repoId={props.loaderData.video.lesson.section.repo.id}
      lessonId={props.loaderData.video.lesson.id}
      videoPath={props.loaderData.video.path}
      lessonPath={props.loaderData.video.lesson.path}
      repoName={props.loaderData.video.lesson.section.repo.name}
      videoId={props.loaderData.video.id}
    />
  );
}
