import { Layer } from "effect";
import { DBService } from "./db-service";
import { DatabaseDumpService } from "./dump-service";
import { RepoParserService } from "./repo-parser";
import { NodeContext } from "@effect/platform-node";
import { TotalTypeScriptCLIService } from "./tt-cli-service";

export const layerLive = Layer.mergeAll(
  RepoParserService.Default,
  DatabaseDumpService.Default,
  TotalTypeScriptCLIService.Default,
  DBService.Default,
  NodeContext.layer
);
