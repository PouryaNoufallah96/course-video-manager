import { useState, useEffect, useCallback, useRef } from "react";
import type { Plan, Section, Lesson } from "@/features/course-planner/types";

function generateId(): string {
  return crypto.randomUUID();
}

function getTimestamp(): string {
  return new Date().toISOString();
}

export interface UsePlanOptions {
  initialPlan: Plan;
}

export function usePlan(options: UsePlanOptions) {
  const { initialPlan } = options;

  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan.id]);

  const isInitialMount = useRef(true);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const syncPlan = useCallback(async (planToSync: Plan) => {
    try {
      const response = await fetch("/api/plans/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planToSync }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error ||
            `Sync failed with status ${response.status}`
        );
      }

      setSyncError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sync plan";
      setSyncError(message);
    }
  }, []);

  const retrySync = useCallback(() => {
    syncPlan(plan);
  }, [syncPlan, plan]);

  // Debounced sync to Postgres (750ms)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncPlan(plan);
    }, 750);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [plan, syncPlan]);

  // Plan operations
  const updatePlan = useCallback((updates: Partial<Pick<Plan, "title">>) => {
    setPlan((prev) => ({ ...prev, ...updates, updatedAt: getTimestamp() }));
  }, []);

  const duplicatePlan = useCallback(async (): Promise<Plan> => {
    const now = getTimestamp();
    const newPlan: Plan = {
      id: generateId(),
      title: `${plan.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      sections: plan.sections.map((section) => ({
        ...section,
        id: generateId(),
        lessons: section.lessons.map((lesson) => ({
          ...lesson,
          id: generateId(),
        })),
      })),
    };

    // Sync immediately before returning
    const response = await fetch("/api/plans/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: newPlan }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { error?: string }).error ||
          `Sync failed with status ${response.status}`
      );
    }

    return newPlan;
  }, [plan]);

  // Section operations
  const addSection = useCallback((title: string): Section | undefined => {
    let newSection: Section | undefined;
    setPlan((prev) => {
      const maxOrder = Math.max(0, ...prev.sections.map((s) => s.order));

      newSection = {
        id: generateId(),
        title,
        order: maxOrder + 1,
        lessons: [],
      };

      return {
        ...prev,
        sections: [...prev.sections, newSection],
        updatedAt: getTimestamp(),
      };
    });
    return newSection;
  }, []);

  const updateSection = useCallback(
    (sectionId: string, updates: Partial<Pick<Section, "title">>) => {
      setPlan((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === sectionId ? { ...section, ...updates } : section
        ),
        updatedAt: getTimestamp(),
      }));
    },
    []
  );

  const deleteSection = useCallback((sectionId: string) => {
    setPlan((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
      updatedAt: getTimestamp(),
    }));
  }, []);

  const reorderSection = useCallback((sectionId: string, newIndex: number) => {
    setPlan((prev) => {
      const sortedSections = [...prev.sections].sort(
        (a, b) => a.order - b.order
      );
      const currentIndex = sortedSections.findIndex((s) => s.id === sectionId);
      if (currentIndex === -1 || currentIndex === newIndex) return prev;

      const [movedSection] = sortedSections.splice(currentIndex, 1) as [
        Section,
      ];
      sortedSections.splice(newIndex, 0, movedSection);

      const reorderedSections = sortedSections.map((section, index) => ({
        ...section,
        order: index,
      }));

      return {
        ...prev,
        sections: reorderedSections,
        updatedAt: getTimestamp(),
      };
    });
  }, []);

  // Lesson operations
  const addLesson = useCallback(
    (sectionId: string, title: string): Lesson | undefined => {
      let newLesson: Lesson | undefined;
      setPlan((prev) => ({
        ...prev,
        sections: prev.sections.map((section) => {
          if (section.id !== sectionId) return section;

          const maxOrder = Math.max(0, ...section.lessons.map((l) => l.order));

          newLesson = {
            id: generateId(),
            title,
            order: maxOrder + 1,
            description: "",
          };

          return {
            ...section,
            lessons: [...section.lessons, newLesson],
          };
        }),
        updatedAt: getTimestamp(),
      }));
      return newLesson;
    },
    []
  );

  const updateLesson = useCallback(
    (
      sectionId: string,
      lessonId: string,
      updates: Partial<
        Pick<Lesson, "title" | "description" | "icon" | "dependencies">
      >
    ) => {
      setPlan((prev) => ({
        ...prev,
        sections: prev.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            lessons: section.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, ...updates } : lesson
            ),
          };
        }),
        updatedAt: getTimestamp(),
      }));
    },
    []
  );

  const deleteLesson = useCallback((sectionId: string, lessonId: string) => {
    setPlan((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        const filteredLessons =
          section.id === sectionId
            ? section.lessons.filter((lesson) => lesson.id !== lessonId)
            : section.lessons;

        // Remove deleted lesson from other lessons' dependencies
        const updatedLessons = filteredLessons.map((lesson) => {
          if (lesson.dependencies && lesson.dependencies.includes(lessonId)) {
            return {
              ...lesson,
              dependencies: lesson.dependencies.filter((id) => id !== lessonId),
            };
          }
          return lesson;
        });

        return {
          ...section,
          lessons: updatedLessons,
        };
      }),
      updatedAt: getTimestamp(),
    }));
  }, []);

  const reorderLesson = useCallback(
    (
      fromSectionId: string,
      toSectionId: string,
      lessonId: string,
      newIndex: number
    ) => {
      setPlan((prev) => {
        const fromSection = prev.sections.find((s) => s.id === fromSectionId);
        const lesson = fromSection?.lessons.find((l) => l.id === lessonId);
        if (!lesson) return prev;

        const toSection = prev.sections.find((s) => s.id === toSectionId);
        if (!toSection) return prev;

        return {
          ...prev,
          sections: prev.sections.map((section) => {
            if (fromSectionId === toSectionId) {
              if (section.id !== toSectionId) return section;

              const sortedLessons = [...section.lessons].sort(
                (a, b) => a.order - b.order
              );
              const currentIndex = sortedLessons.findIndex(
                (l) => l.id === lessonId
              );
              if (currentIndex === -1 || currentIndex === newIndex)
                return section;

              const [movedLesson] = sortedLessons.splice(currentIndex, 1) as [
                Lesson,
              ];
              sortedLessons.splice(newIndex, 0, movedLesson);

              const reorderedLessons = sortedLessons.map((l, index) => ({
                ...l,
                order: index,
              }));

              return {
                ...section,
                lessons: reorderedLessons,
              };
            } else {
              if (section.id === fromSectionId) {
                const remainingLessons = section.lessons
                  .filter((l) => l.id !== lessonId)
                  .sort((a, b) => a.order - b.order)
                  .map((l, index) => ({ ...l, order: index }));
                return {
                  ...section,
                  lessons: remainingLessons,
                };
              }
              if (section.id === toSectionId) {
                const sortedLessons = [...section.lessons].sort(
                  (a, b) => a.order - b.order
                );
                sortedLessons.splice(newIndex, 0, lesson);

                const reorderedLessons = sortedLessons.map((l, index) => ({
                  ...l,
                  order: index,
                }));

                return {
                  ...section,
                  lessons: reorderedLessons,
                };
              }
            }
            return section;
          }),
          updatedAt: getTimestamp(),
        };
      });
    },
    []
  );

  return {
    plan,
    syncError,
    retrySync,
    updatePlan,
    duplicatePlan,
    addSection,
    updateSection,
    deleteSection,
    reorderSection,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLesson,
  };
}
