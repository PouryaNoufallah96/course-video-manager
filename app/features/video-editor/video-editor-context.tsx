import { createContext } from "react";

export type VideoEditorContextType = {
  currentTimeInClip: number;
};

export const VideoEditorContext = createContext<VideoEditorContextType>(null!);
