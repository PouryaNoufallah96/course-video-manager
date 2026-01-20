import { AppSidebar } from "@/components/app-sidebar";
import { Code, Monitor, Play, Terminal, Eye } from "lucide-react";
import type { Route } from "./+types/icon-prototype";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Icon Prototype - CVM" }];
};

// Mock data for demonstration
const mockLessons = [
  {
    id: "1",
    title: "Introduction to TypeScript",
    description:
      "Learn the basics of TypeScript and why it matters for modern development.",
    icon: "watch" as const,
  },
  {
    id: "2",
    title: "Setting up your environment",
    description: "Configure VS Code and install the necessary extensions.",
    icon: "code" as const,
  },
  {
    id: "3",
    title: "Your first type annotation",
    description: "",
    icon: "code" as const,
  },
  {
    id: "4",
    title: "Understanding type inference",
    description: "How TypeScript automatically infers types from your code.",
    icon: "watch" as const,
  },
];

// ============================================================================
// VARIANT 1: Current - Large icon in separate left column
// ============================================================================
function Variant1() {
  return (
    <div className="space-y-1">
      {mockLessons.map((lesson, index) => (
        <div
          key={lesson.id}
          className="py-2 px-3 rounded hover:bg-muted/50 group"
        >
          <div className="flex gap-3">
            {/* Icon column - large and prominent */}
            <button
              className="flex-shrink-0 p-1.5 hover:bg-muted rounded self-start mt-0.5"
              title={lesson.icon === "code" ? "Interactive" : "Watch"}
            >
              {lesson.icon === "code" ? (
                <Code className="w-6 h-6 text-foreground" />
              ) : (
                <Monitor className="w-6 h-6 text-foreground" />
              )}
            </button>

            {/* Content column */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground">
                  1.{index + 1}
                </span>
                <span className="text-sm flex-1 ml-2">{lesson.title}</span>
              </div>
              {lesson.description && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {lesson.description}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// VARIANT 2: Inline icon after number, before title (smaller, inline)
// ============================================================================
function Variant2() {
  return (
    <div className="space-y-1">
      {mockLessons.map((lesson, index) => (
        <div
          key={lesson.id}
          className="py-2 px-3 rounded hover:bg-muted/50 group"
        >
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">
              1.{index + 1}
            </span>
            <button
              className="p-1 hover:bg-muted rounded mr-1"
              title={lesson.icon === "code" ? "Interactive" : "Watch"}
            >
              {lesson.icon === "code" ? (
                <Code className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Monitor className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <span className="text-sm flex-1">{lesson.title}</span>
          </div>
          {lesson.description && (
            <div className="mt-1 ml-14 text-xs text-muted-foreground">
              {lesson.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// VARIANT 3: Badge-style icon with background color
// ============================================================================
function Variant3() {
  return (
    <div className="space-y-1">
      {mockLessons.map((lesson, index) => (
        <div
          key={lesson.id}
          className="py-2 px-3 rounded hover:bg-muted/50 group"
        >
          <div className="flex items-center gap-3">
            {/* Badge-style icon */}
            <button
              className={`flex-shrink-0 p-2 rounded-md ${
                lesson.icon === "code"
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-purple-500/10 text-purple-500"
              }`}
              title={lesson.icon === "code" ? "Interactive" : "Watch"}
            >
              {lesson.icon === "code" ? (
                <Terminal className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                  1.{index + 1}
                </span>
                <span className="text-sm flex-1">{lesson.title}</span>
              </div>
              {lesson.description && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {lesson.description}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// VARIANT 4: Pill/tag after title
// ============================================================================
function Variant4() {
  return (
    <div className="space-y-1">
      {mockLessons.map((lesson, index) => (
        <div
          key={lesson.id}
          className="py-2 px-3 rounded hover:bg-muted/50 group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">1.{index + 1}</span>
            <span className="text-sm">{lesson.title}</span>
            <button
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${
                lesson.icon === "code"
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-purple-500/10 text-purple-500"
              }`}
              title={lesson.icon === "code" ? "Interactive" : "Watch"}
            >
              {lesson.icon === "code" ? (
                <>
                  <Terminal className="w-3 h-3" />
                  <span>code</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  <span>watch</span>
                </>
              )}
            </button>
          </div>
          {lesson.description && (
            <div className="mt-1 ml-8 text-xs text-muted-foreground">
              {lesson.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function IconPrototypePage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl">
          <h1 className="text-2xl font-bold mb-2">Icon Treatment Prototypes</h1>
          <p className="text-muted-foreground mb-8">
            Four different approaches to displaying lesson type icons. Click
            each to see how they feel.
          </p>

          <div className="grid grid-cols-2 gap-8">
            {/* Variant 1 */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-1">
                Variant 1: Current Design
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Large icon (24px) in separate left column. Prominent and visual.
              </p>
              <div className="border-t pt-4">
                <Variant1 />
              </div>
            </div>

            {/* Variant 2 */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-1">
                Variant 2: Inline Small
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Small icon (16px) inline between number and title. Subtle and
                compact.
              </p>
              <div className="border-t pt-4">
                <Variant2 />
              </div>
            </div>

            {/* Variant 3 */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-1">
                Variant 3: Colored Badge
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Icon with colored background. Blue for code, purple for watch.
              </p>
              <div className="border-t pt-4">
                <Variant3 />
              </div>
            </div>

            {/* Variant 4 */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-1">
                Variant 4: Labeled Pill
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Pill with icon + text after title. Explicit but takes more
                space.
              </p>
              <div className="border-t pt-4">
                <Variant4 />
              </div>
            </div>
          </div>

          {/* Additional comparison: Full section view */}
          <h2 className="text-xl font-semibold mt-12 mb-4">
            Full Section Preview
          </h2>
          <p className="text-muted-foreground mb-6">
            How each variant looks in the context of a full section with header.
          </p>

          <div className="space-y-8">
            {/* Variant 1 Full */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-lg">
                  <span className="text-muted-foreground mr-2">1.</span>
                  Getting Started with TypeScript
                </h3>
              </div>
              <div className="ml-4">
                <Variant1 />
              </div>
            </div>

            {/* Variant 2 Full */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-lg">
                  <span className="text-muted-foreground mr-2">1.</span>
                  Getting Started with TypeScript
                </h3>
              </div>
              <div className="ml-4">
                <Variant2 />
              </div>
            </div>

            {/* Variant 3 Full */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-lg">
                  <span className="text-muted-foreground mr-2">1.</span>
                  Getting Started with TypeScript
                </h3>
              </div>
              <div className="ml-4">
                <Variant3 />
              </div>
            </div>

            {/* Variant 4 Full */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-lg">
                  <span className="text-muted-foreground mr-2">1.</span>
                  Getting Started with TypeScript
                </h3>
              </div>
              <div className="ml-4">
                <Variant4 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
