import { cn } from "@/lib/utils";
import React from "react";
import type { ClipSectionDividerProps } from "../types";

/**
 * Visual divider component for clip sections in the timeline.
 *
 * Displays a horizontal line with the section name in the center.
 * Uses sticky positioning to stay visible while scrolling through clips.
 *
 * @example
 * <ClipSectionDivider
 *   name="Introduction"
 *   isSelected={selectedClipsSet.has(sectionId)}
 *   onClick={() => handleSectionClick(sectionId)}
 * />
 */
export const ClipSectionDivider = React.forwardRef<
  HTMLButtonElement,
  ClipSectionDividerProps
>(({ name, isSelected, onClick, className, ...rest }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex items-center gap-3 py-2 px-3 w-full allow-keydown",
        "sticky top-0 z-10 bg-gray-900",
        "hover:bg-gray-800/50 rounded-md transition-colors",
        isSelected && "bg-gray-700 outline-2 outline-gray-200",
        className
      )}
      onClick={onClick}
      {...rest}
    >
      <div className="border-t-2 border-gray-500 flex-1" />
      <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
        {name}
      </span>
      <div className="border-t-2 border-gray-500 flex-1" />
    </button>
  );
});
ClipSectionDivider.displayName = "ClipSectionDivider";
