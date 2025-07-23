import { db } from "@/db/db";
import { lessons, repos, sections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Data, Effect } from "effect";

class NotFoundError extends Data.TaggedError("NotFoundError")<{
  type: string;
  params: object;
}> {}

class UnknownDBServiceError extends Data.TaggedError("UnknownDBServiceError")<{
  cause: unknown;
}> {}

const makeDbCall = <T>(fn: () => Promise<T>) => {
  return Effect.tryPromise({
    try: fn,
    catch: (e) => new UnknownDBServiceError({ cause: e }),
  });
};

export class DBService extends Effect.Service<DBService>()("DBService", {
  effect: Effect.gen(function* () {
    return {
      getRepo: Effect.fn("getRepo")(function* (filePath: string) {
        const repo = yield* makeDbCall(() =>
          db.query.repos.findFirst({
            where: eq(repos.filePath, filePath),
          })
        );

        if (!repo) {
          return yield* new NotFoundError({
            type: "getRepo",
            params: { filePath },
          });
        }

        return repo;
      }),
      createRepo: Effect.fn("createRepo")(function* (filePath: string) {
        const reposResult = yield* makeDbCall(() =>
          db.insert(repos).values({ filePath }).returning()
        );

        const repo = reposResult[0];

        if (!repo) {
          return yield* new UnknownDBServiceError({
            cause: "No repo was returned from the database",
          });
        }

        return repo;
      }),
      createSections: Effect.fn("createSections")(function* (
        repoId: string,
        newSections: {
          sectionPathWithNumber: string;
          sectionNumber: number;
        }[]
      ) {
        const sectionResult = yield* makeDbCall(() =>
          db
            .insert(sections)
            .values(
              newSections.map((section) => ({
                repoId,
                path: section.sectionPathWithNumber,
                order: section.sectionNumber,
              }))
            )
            .returning()
        );

        return sectionResult;
      }),

      createLessons: Effect.fn("createLessons")(function* (
        sectionId: string,
        newLessons: {
          lessonPathWithNumber: string;
          lessonNumber: number;
        }[]
      ) {
        const lessonResult = yield* makeDbCall(() =>
          db
            .insert(lessons)
            .values(
              newLessons.map((lesson) => ({
                sectionId,
                path: lesson.lessonPathWithNumber,
                order: lesson.lessonNumber,
              }))
            )
            .returning()
        );

        return lessonResult;
      }),
    };
  }),
}) {}
