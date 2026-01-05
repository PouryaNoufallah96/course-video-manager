import { cn } from "@/lib/utils";

const TOTAL_DOTS = 8;
const TARGET_DOTS = 6; // 75% target (6 out of 8)

/**
 * Volume indicator showing 8 dots where 6 filled = 75% volume target.
 * @param volumeLevel - Normalized volume from 0-1
 */
export const VolumeIndicator = (props: { volumeLevel: number }) => {
  // Map volume to number of filled dots (0-8)
  const filledDots = Math.round(props.volumeLevel * TOTAL_DOTS);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: TOTAL_DOTS }).map((_, index) => {
        const isFilled = index < filledDots;
        const isTarget = index < TARGET_DOTS;

        return (
          <div
            key={index}
            className={cn(
              "size-2 rounded-full transition-colors duration-75",
              isFilled
                ? isTarget
                  ? "bg-green-500"
                  : "bg-red-500"
                : isTarget
                  ? "bg-gray-600"
                  : "bg-gray-700"
            )}
          />
        );
      })}
    </div>
  );
};
