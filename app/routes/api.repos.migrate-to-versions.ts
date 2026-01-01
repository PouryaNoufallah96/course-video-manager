import { db } from "@/db/db";
import { repoVersions, sections } from "@/db/schema";
import { withDatabaseDump } from "@/services/dump-service";
import { layerLive } from "@/services/layer";
import { eq } from "drizzle-orm";
import { ConfigProvider, Console, Effect } from "effect";
import type { Route } from "./+types/api.repos.migrate-to-versions";
import { data } from "react-router";

/**
 * Migration endpoint to create v1.0 for existing repos that don't have versions.
 * This should be run once when transitioning to the versioned system.
 *
 * POST /api/repos/migrate-to-versions
 */
export const action = async (_args: Route.ActionArgs) => {
  return Effect.gen(function* () {
    // Get all repos
    const allRepos = yield* Effect.tryPromise(() => db.query.repos.findMany());

    let migratedCount = 0;
    let skippedCount = 0;

    for (const repo of allRepos) {
      // Check if repo already has a version
      const existingVersion = yield* Effect.tryPromise(() =>
        db.query.repoVersions.findFirst({
          where: eq(repoVersions.repoId, repo.id),
        })
      );

      if (existingVersion) {
        skippedCount++;
        continue;
      }

      // Create v1.0 version for this repo
      const [newVersion] = yield* Effect.tryPromise(() =>
        db
          .insert(repoVersions)
          .values({
            repoId: repo.id,
            name: "v1.0",
          })
          .returning()
      );

      if (!newVersion) {
        yield* Console.error(`Failed to create version for repo ${repo.id}`);
        continue;
      }

      // Update all sections for this repo that don't have a repoVersionId
      yield* Effect.tryPromise(() =>
        db
          .update(sections)
          .set({ repoVersionId: newVersion.id })
          .where(eq(sections.repoId, repo.id))
      );

      migratedCount++;
      yield* Console.log(
        `Migrated repo "${repo.name}" (${repo.id}) to version v1.0`
      );
    }

    return {
      success: true,
      migratedCount,
      skippedCount,
      totalRepos: allRepos.length,
    };
  }).pipe(
    withDatabaseDump,
    Effect.withConfigProvider(ConfigProvider.fromEnv()),
    Effect.provide(layerLive),
    Effect.tapErrorCause((cause) => {
      return Console.error(cause);
    }),
    Effect.catchAll((e) => {
      return Effect.die(data({ error: String(e) }, { status: 500 }));
    }),
    Effect.provide(layerLive),
    Effect.runPromise
  );
};
