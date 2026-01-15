import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import type { ClipSection, FrontendId } from "../clip-state-reducer";
import type { videoStateReducer } from "../video-state-reducer";
import { ClipSectionDivider } from "./clip-section-divider";
import { InsertionPointIndicator } from "./timeline-indicators";
import type { FrontendInsertionPoint } from "../clip-state-reducer";

/**
 * ClipSectionItem component displays a clip section divider with context menu
 * in the video editor timeline.
 *
 * Handles section selection, insertion point display, and all section actions
 * including insert before/after, add section before/after, edit, move, and delete.
 */
export const ClipSectionItem = (props: {
  section: ClipSection;
  isFirstItem: boolean;
  isLastItem: boolean;
  isSelected: boolean;
  insertionPoint: FrontendInsertionPoint;
  selectedClipsSet: Set<FrontendId>;
  dispatch: (action: videoStateReducer.Action) => void;
  onSetInsertionPoint: (mode: "after" | "before", clipId: FrontendId) => void;
  onMoveClip: (clipId: FrontendId, direction: "up" | "down") => void;
  onEditSection: () => void;
  onAddSectionBefore: () => void;
  onAddSectionAfter: () => void;
}) => {
  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <ClipSectionDivider
            id={`section-${props.section.frontendId}`}
            name={props.section.name}
            isSelected={props.isSelected}
            onClick={(e) => {
              // If already selected and clicked again (without modifiers),
              // play from the next clip after this section
              if (
                !e.ctrlKey &&
                !e.shiftKey &&
                props.selectedClipsSet.has(props.section.frontendId) &&
                props.selectedClipsSet.size === 1
              ) {
                props.dispatch({
                  type: "play-from-clip-section",
                  clipSectionId: props.section.frontendId,
                });
                return;
              }
              props.dispatch({
                type: "click-clip",
                clipId: props.section.frontendId,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
              });
            }}
          />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onSelect={() => {
              props.onSetInsertionPoint("before", props.section.frontendId);
            }}
          >
            <ChevronLeftIcon />
            Insert Before
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => {
              props.onSetInsertionPoint("after", props.section.frontendId);
            }}
          >
            <ChevronRightIcon />
            Insert After
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={props.onAddSectionBefore}>
            <PlusIcon />
            Add Section Before
          </ContextMenuItem>
          <ContextMenuItem onSelect={props.onAddSectionAfter}>
            <PlusIcon />
            Add Section After
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={props.onEditSection}>
            <PencilIcon />
            Edit
          </ContextMenuItem>
          <ContextMenuItem
            disabled={props.isFirstItem}
            onSelect={() => {
              props.onMoveClip(props.section.frontendId, "up");
            }}
          >
            <ArrowUpIcon />
            Move Up
          </ContextMenuItem>
          <ContextMenuItem
            disabled={props.isLastItem}
            onSelect={() => {
              props.onMoveClip(props.section.frontendId, "down");
            }}
          >
            <ArrowDownIcon />
            Move Down
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onSelect={() => {
              props.dispatch({
                type: "delete-clip",
                clipId: props.section.frontendId,
              });
            }}
          >
            <Trash2Icon />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {props.insertionPoint.type === "after-clip-section" &&
        props.insertionPoint.frontendClipSectionId ===
          props.section.frontendId && <InsertionPointIndicator />}
    </div>
  );
};
