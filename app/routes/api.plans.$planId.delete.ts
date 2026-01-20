import { Console, Effect } from "effect";
import type { Route } from "./+types/api.plans.$planId.delete";
import { DBService } from "@/services/db-service";
import { layerLive } from "@/services/layer";
import { data } from "react-router";

export const action = async (args: Route.ActionArgs) => {
  const planId = args.params.planId;

  return Effect.gen(function* () {
    const db = yield* DBService;
    yield* db.deletePlan(planId);

    return { success: true };
  }).pipe(
    Effect.tapErrorCause((e) => Console.dir(e, { depth: null })),
    Effect.catchAll(() => {
      return Effect.die(data("Internal server error", { status: 500 }));
    }),
    Effect.provide(layerLive),
    Effect.runPromise
  );
};
