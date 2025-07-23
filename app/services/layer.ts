import { Layer } from "effect";
import { RepoParserService } from "./repo-parser";
import { DBService } from "./db-service";

export const layerLive = Layer.mergeAll(
  RepoParserService.Default,
  DBService.Default
);
