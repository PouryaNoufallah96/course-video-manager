import { Console, Effect } from "effect";
import type { Route } from "./+types/api.plans";
import { layerLive } from "@/services/layer";
import { data } from "react-router";
import { DBService } from "@/services/db-service";

export const loader = async (_args: Route.LoaderArgs) => {
  return Effect.gen(function* () {
    const db = yield* DBService;
    const plans = yield* db.getPlans();

    return { plans };
  }).pipe(
    Effect.tapErrorCause((e) => Console.dir(e, { depth: null })),
    Effect.catchAll(() => {
      return Effect.die(data("Internal server error", { status: 500 }));
    }),
    Effect.provide(layerLive),
    Effect.runPromise
  );
};
