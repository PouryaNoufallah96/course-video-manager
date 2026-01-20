import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Code,
  Link2,
  MessageCircle,
  Play,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/dependency-prototype";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Dependency Prototype - CVM" }];
};

// Extended lesson type with dependencies
interface LessonWithDeps {
  id: string;
  number: string;
  title: string;
  icon: "watch" | "code" | "discussion";
  description?: string;
  dependencies: string[]; // IDs of lessons this depends on
}

// Mock data for prototype
const mockLessons: LessonWithDeps[] = [
  {
    id: "1",
    number: "1.1",
    title: "Introduction to TypeScript",
    icon: "watch",
    dependencies: [],
  },
  {
    id: "2",
    number: "1.2",
    title: "Setting Up Your Environment",
    icon: "code",
    description: "Install Node.js and configure your IDE",
    dependencies: ["1"],
  },
  {
    id: "3",
    number: "1.3",
    title: "Basic Types",
    icon: "watch",
    dependencies: ["2"],
  },
  {
    id: "4",
    number: "2.1",
    title: "Functions and Parameters",
    icon: "code",
    dependencies: ["3"],
  },
  {
    id: "5",
    number: "2.2",
    title: "Generics Introduction",
    icon: "watch",
    dependencies: ["3", "4"],
  },
  {
    id: "6",
    number: "2.3",
    title: "Q&A Session",
    icon: "discussion",
    dependencies: [],
  },
];

// Helper to check if dependency order is violated
function checkDependencyViolation(
  lesson: LessonWithDeps,
  allLessons: LessonWithDeps[]
): LessonWithDeps[] {
  const violations: LessonWithDeps[] = [];
  const lessonIndex = allLessons.findIndex((l) => l.id === lesson.id);

  for (const depId of lesson.dependencies) {
    const depLesson = allLessons.find((l) => l.id === depId);
    if (depLesson) {
      const depIndex = allLessons.findIndex((l) => l.id === depId);
      if (depIndex > lessonIndex) {
        violations.push(depLesson);
      }
    }
  }

  return violations;
}

// Get lesson by ID
function getLessonById(
  id: string,
  lessons: LessonWithDeps[]
): LessonWithDeps | undefined {
  return lessons.find((l) => l.id === id);
}

// Icon component
function LessonIcon({ icon }: { icon: LessonWithDeps["icon"] }) {
  const className = `flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
    icon === "code"
      ? "bg-yellow-500/20 text-yellow-600"
      : icon === "discussion"
        ? "bg-green-500/20 text-green-600"
        : "bg-purple-500/20 text-purple-600"
  }`;

  return (
    <div className={className}>
      {icon === "code" ? (
        <Code className="w-3.5 h-3.5" />
      ) : icon === "discussion" ? (
        <MessageCircle className="w-3.5 h-3.5" />
      ) : (
        <Play className="w-3.5 h-3.5" />
      )}
    </div>
  );
}

// Variant 1: Badge Pills - Dependencies shown as small clickable badges
function Variant1BadgePills({
  lessons,
  onUpdateDependencies,
}: {
  lessons: LessonWithDeps[];
  onUpdateDependencies: (lessonId: string, deps: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {lessons.map((lesson) => {
        const violations = checkDependencyViolation(lesson, lessons);
        return (
          <div
            key={lesson.id}
            className={`py-2 px-3 rounded border ${violations.length > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}`}
          >
            <div className="flex items-center gap-3">
              <LessonIcon icon={lesson.icon} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {lesson.number}
                  </span>
                  <span className="text-sm">{lesson.title}</span>
                </div>
                {/* Dependencies as badges */}
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {lesson.dependencies.map((depId) => {
                    const dep = getLessonById(depId, lessons);
                    const isViolation = violations.some((v) => v.id === depId);
                    return dep ? (
                      <span
                        key={depId}
                        className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                          isViolation
                            ? "bg-amber-500/20 text-amber-600"
                            : "bg-blue-500/20 text-blue-600"
                        }`}
                      >
                        <ArrowLeft className="w-3 h-3" />
                        {dep.number}
                        <button
                          className="hover:text-foreground"
                          onClick={() =>
                            onUpdateDependencies(
                              lesson.id,
                              lesson.dependencies.filter((d) => d !== depId)
                            )
                          }
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                  {/* Add dependency dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center text-xs px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Plus className="w-3 h-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Add dependency</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {lessons
                        .filter(
                          (l) =>
                            l.id !== lesson.id &&
                            !lesson.dependencies.includes(l.id)
                        )
                        .map((l) => (
                          <DropdownMenuItem
                            key={l.id}
                            onSelect={() =>
                              onUpdateDependencies(lesson.id, [
                                ...lesson.dependencies,
                                l.id,
                              ])
                            }
                          >
                            {l.number} {l.title}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {violations.length > 0 && (
                <div
                  className="text-amber-500"
                  title={`Depends on ${violations.map((v) => v.number).join(", ")} which comes later`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Variant 2: Inline Dropdown - Compact dropdown showing "Requires: X, Y"
function Variant2InlineDropdown({
  lessons,
  onUpdateDependencies,
}: {
  lessons: LessonWithDeps[];
  onUpdateDependencies: (lessonId: string, deps: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {lessons.map((lesson) => {
        const violations = checkDependencyViolation(lesson, lessons);
        return (
          <div
            key={lesson.id}
            className={`py-2 px-3 rounded border ${violations.length > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}`}
          >
            <div className="flex items-center gap-3">
              <LessonIcon icon={lesson.icon} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {lesson.number}
                  </span>
                  <span className="text-sm">{lesson.title}</span>
                </div>
              </div>
              {/* Dropdown for editing dependencies */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-muted ${
                      violations.length > 0
                        ? "text-amber-600"
                        : lesson.dependencies.length > 0
                          ? "text-blue-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    <Link2 className="w-3 h-3" />
                    {lesson.dependencies.length > 0 ? (
                      <>
                        {lesson.dependencies
                          .map((id) => getLessonById(id, lessons)?.number)
                          .join(", ")}
                        {violations.length > 0 && (
                          <AlertTriangle className="w-3 h-3 ml-1" />
                        )}
                      </>
                    ) : (
                      "No deps"
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Dependencies</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {lessons
                    .filter((l) => l.id !== lesson.id)
                    .map((l) => (
                      <DropdownMenuCheckboxItem
                        key={l.id}
                        checked={lesson.dependencies.includes(l.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onUpdateDependencies(lesson.id, [
                              ...lesson.dependencies,
                              l.id,
                            ]);
                          } else {
                            onUpdateDependencies(
                              lesson.id,
                              lesson.dependencies.filter((d) => d !== l.id)
                            );
                          }
                        }}
                      >
                        {l.number} {l.title}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Variant 3: Visual Lines - Show dependency connections with lines
function Variant3VisualLines({ lessons }: { lessons: LessonWithDeps[] }) {
  return (
    <div className="space-y-2 relative">
      {lessons.map((lesson, index) => {
        const violations = checkDependencyViolation(lesson, lessons);
        const hasDeps = lesson.dependencies.length > 0;
        const isDependedOn = lessons.some((l) =>
          l.dependencies.includes(lesson.id)
        );

        return (
          <div key={lesson.id} className="flex items-center gap-2">
            {/* Dependency indicator column */}
            <div className="w-8 flex flex-col items-center relative">
              {hasDeps && (
                <div
                  className={`absolute -top-2 w-0.5 h-4 ${violations.length > 0 ? "bg-amber-500" : "bg-blue-500"}`}
                />
              )}
              <div
                className={`w-2 h-2 rounded-full ${
                  violations.length > 0
                    ? "bg-amber-500"
                    : hasDeps || isDependedOn
                      ? "bg-blue-500"
                      : "bg-muted"
                }`}
              />
              {isDependedOn && index < lessons.length - 1 && (
                <div className="w-0.5 flex-1 bg-blue-500/30 mt-0.5" />
              )}
            </div>

            <div
              className={`flex-1 py-2 px-3 rounded border ${violations.length > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}`}
            >
              <div className="flex items-center gap-3">
                <LessonIcon icon={lesson.icon} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {lesson.number}
                    </span>
                    <span className="text-sm">{lesson.title}</span>
                  </div>
                  {hasDeps && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Requires:{" "}
                      {lesson.dependencies
                        .map((id) => getLessonById(id, lessons)?.number)
                        .join(", ")}
                    </div>
                  )}
                </div>
                {violations.length > 0 && (
                  <div
                    className="text-amber-500"
                    title={`Order violation: depends on ${violations.map((v) => v.number).join(", ")}`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Variant 4: Expandable Row - Click to expand and see/edit dependencies
function Variant4ExpandableRow({
  lessons,
  onUpdateDependencies,
}: {
  lessons: LessonWithDeps[];
  onUpdateDependencies: (lessonId: string, deps: string[]) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {lessons.map((lesson) => {
        const violations = checkDependencyViolation(lesson, lessons);
        const isExpanded = expandedId === lesson.id;

        return (
          <div
            key={lesson.id}
            className={`rounded border ${violations.length > 0 ? "border-amber-500/50" : ""}`}
          >
            <button
              className={`w-full py-2 px-3 flex items-center gap-3 hover:bg-muted/50 ${isExpanded ? "bg-muted/30" : ""} ${violations.length > 0 ? "bg-amber-500/5" : ""}`}
              onClick={() => setExpandedId(isExpanded ? null : lesson.id)}
            >
              <ChevronRight
                className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
              <LessonIcon icon={lesson.icon} />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {lesson.number}
                  </span>
                  <span className="text-sm">{lesson.title}</span>
                </div>
              </div>
              {lesson.dependencies.length > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${violations.length > 0 ? "bg-amber-500/20 text-amber-600" : "bg-blue-500/20 text-blue-600"}`}
                >
                  {lesson.dependencies.length} dep
                  {lesson.dependencies.length !== 1 ? "s" : ""}
                </span>
              )}
              {violations.length > 0 && (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {isExpanded && (
              <div className="px-3 pb-3 pt-1 border-t bg-muted/20">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Dependencies:
                </div>
                <div className="space-y-1">
                  {lessons
                    .filter((l) => l.id !== lesson.id)
                    .map((l) => {
                      const isDep = lesson.dependencies.includes(l.id);
                      const isViolation =
                        isDep && violations.some((v) => v.id === l.id);
                      return (
                        <button
                          key={l.id}
                          className={`w-full text-left text-sm px-2 py-1 rounded flex items-center gap-2 ${
                            isDep
                              ? isViolation
                                ? "bg-amber-500/20 text-amber-700"
                                : "bg-blue-500/20 text-blue-700"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => {
                            if (isDep) {
                              onUpdateDependencies(
                                lesson.id,
                                lesson.dependencies.filter((d) => d !== l.id)
                              );
                            } else {
                              onUpdateDependencies(lesson.id, [
                                ...lesson.dependencies,
                                l.id,
                              ]);
                            }
                          }}
                        >
                          {isDep ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <span className="w-3" />
                          )}
                          <span className="text-muted-foreground">
                            {l.number}
                          </span>
                          {l.title}
                          {isViolation && (
                            <span className="ml-auto text-xs text-amber-600">
                              (out of order!)
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Variant 5: Warning Banner - Show violations as prominent banner at top
function Variant5WarningBanner({
  lessons,
  onUpdateDependencies: _onUpdateDependencies,
}: {
  lessons: LessonWithDeps[];
  onUpdateDependencies: (lessonId: string, deps: string[]) => void;
}) {
  void _onUpdateDependencies;
  const allViolations: {
    lesson: LessonWithDeps;
    violations: LessonWithDeps[];
  }[] = [];
  lessons.forEach((lesson) => {
    const violations = checkDependencyViolation(lesson, lessons);
    if (violations.length > 0) {
      allViolations.push({ lesson, violations });
    }
  });

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      {allViolations.length > 0 && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-700">
                Dependency Order Issues
              </div>
              <ul className="mt-1 text-sm text-amber-600 space-y-1">
                {allViolations.map(({ lesson, violations }) => (
                  <li key={lesson.id}>
                    <strong>{lesson.number}</strong> depends on{" "}
                    {violations.map((v) => v.number).join(", ")} which{" "}
                    {violations.length === 1 ? "comes" : "come"} later
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Simple lesson list */}
      <div className="space-y-2">
        {lessons.map((lesson) => {
          const hasViolation =
            checkDependencyViolation(lesson, lessons).length > 0;
          return (
            <div key={lesson.id} className="py-2 px-3 rounded border">
              <div className="flex items-center gap-3">
                <LessonIcon icon={lesson.icon} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {lesson.number}
                    </span>
                    <span
                      className={`text-sm ${hasViolation ? "text-amber-600" : ""}`}
                    >
                      {lesson.title}
                    </span>
                  </div>
                  {lesson.dependencies.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Requires:
                      </span>
                      {lesson.dependencies.map((depId) => {
                        const dep = getLessonById(depId, lessons);
                        return dep ? (
                          <span
                            key={depId}
                            className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600"
                          >
                            {dep.number}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DependencyPrototypePage() {
  const [lessons, setLessons] = useState<LessonWithDeps[]>(mockLessons);
  const [activeVariant, setActiveVariant] = useState(1);

  const handleUpdateDependencies = (lessonId: string, deps: string[]) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, dependencies: deps } : l))
    );
  };

  // Create a violated version for demo
  const violatedLessons: LessonWithDeps[] = lessons.map((lesson, index) => {
    if (index === 2) {
      // 1.3 depends on 2.2 (violation!)
      return { ...lesson, dependencies: ["5"] };
    }
    return { ...lesson };
  });

  const variants = [
    {
      id: 1,
      name: "Badge Pills",
      description:
        "Dependencies shown as small removable badges under the title",
    },
    {
      id: 2,
      name: "Inline Dropdown",
      description: "Compact dropdown on the right showing linked lessons",
    },
    {
      id: 3,
      name: "Visual Lines",
      description: "Vertical lines connecting dependent lessons",
    },
    {
      id: 4,
      name: "Expandable Row",
      description: "Click to expand and see/edit dependencies in detail",
    },
    {
      id: 5,
      name: "Warning Banner",
      description: "Violations shown as prominent banner at the top",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
          <h1 className="text-2xl font-bold mt-2">Dependency Prototype</h1>
          <p className="text-muted-foreground mt-1">
            Explore different UI treatments for creating, editing, and
            displaying dependencies between lessons.
          </p>
        </div>

        {/* Variant selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {variants.map((v) => (
            <Button
              key={v.id}
              variant={activeVariant === v.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveVariant(v.id)}
            >
              {v.id}. {v.name}
            </Button>
          ))}
        </div>

        {/* Current variant description */}
        <div className="mb-6 p-3 rounded bg-muted/50 text-sm">
          <strong>{variants[activeVariant - 1]?.name}:</strong>{" "}
          {variants[activeVariant - 1]?.description}
        </div>

        {/* Main preview */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Normal state */}
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-green-500/20 text-green-600 text-xs">
                <Check className="w-4 h-4" />
              </span>
              Valid Order
            </h2>
            <div className="border rounded-lg p-4">
              {activeVariant === 1 && (
                <Variant1BadgePills
                  lessons={lessons}
                  onUpdateDependencies={handleUpdateDependencies}
                />
              )}
              {activeVariant === 2 && (
                <Variant2InlineDropdown
                  lessons={lessons}
                  onUpdateDependencies={handleUpdateDependencies}
                />
              )}
              {activeVariant === 3 && <Variant3VisualLines lessons={lessons} />}
              {activeVariant === 4 && (
                <Variant4ExpandableRow
                  lessons={lessons}
                  onUpdateDependencies={handleUpdateDependencies}
                />
              )}
              {activeVariant === 5 && (
                <Variant5WarningBanner
                  lessons={lessons}
                  onUpdateDependencies={handleUpdateDependencies}
                />
              )}
            </div>
          </div>

          {/* Violated state */}
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-500/20 text-amber-600 text-xs">
                <AlertTriangle className="w-4 h-4" />
              </span>
              Order Violation (1.3 depends on 2.2)
            </h2>
            <div className="border rounded-lg p-4">
              {activeVariant === 1 && (
                <Variant1BadgePills
                  lessons={violatedLessons}
                  onUpdateDependencies={() => {}}
                />
              )}
              {activeVariant === 2 && (
                <Variant2InlineDropdown
                  lessons={violatedLessons}
                  onUpdateDependencies={() => {}}
                />
              )}
              {activeVariant === 3 && (
                <Variant3VisualLines lessons={violatedLessons} />
              )}
              {activeVariant === 4 && (
                <Variant4ExpandableRow
                  lessons={violatedLessons}
                  onUpdateDependencies={() => {}}
                />
              )}
              {activeVariant === 5 && (
                <Variant5WarningBanner
                  lessons={violatedLessons}
                  onUpdateDependencies={() => {}}
                />
              )}
            </div>
          </div>
        </div>

        {/* Implementation notes */}
        <div className="mt-8 border-t pt-6">
          <h2 className="font-semibold mb-3">Implementation Notes</h2>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              <strong>Data model:</strong> Add{" "}
              <code>dependencies: string[]</code> field to Lesson type (array of
              lesson IDs)
            </li>
            <li>
              <strong>Validation:</strong> Check if any dependency appears later
              in the course order than the lesson that depends on it
            </li>
            <li>
              <strong>Cross-section:</strong> Dependencies can span sections
              (e.g., 2.1 can depend on 1.3)
            </li>
            <li>
              <strong>Circular:</strong> Should prevent circular dependencies (A
              depends on B, B depends on A)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
