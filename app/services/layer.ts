import { Config, ConfigProvider, Effect, Layer } from "effect";
import { RepoParserService } from "./repo-parser";
import { DBService } from "./db-service";
import { NodeFileSystem } from "@effect/platform-node";
import { Service } from "effect/Effect";
import { DatabaseDumpService } from "./dump-service";

export const layerLive = Layer.mergeAll(
  RepoParserService.Default,
  DatabaseDumpService.Default,
  DBService.Default,
  NodeFileSystem.layer
);
