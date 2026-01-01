import { describe, expect, it } from "vitest";
import { db } from "@/db/db";
import { clips, lessons, repos, repoVersions, sections, videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DBService } from "./db-service";
import { Effect } from "effect";

describe("DBService - Cascade Deletion", () => {
  it("should cascade delete through version hierarchy: repo -> versions -> sections -> lessons -> videos -> clips", async () => {
    // Create a repo with full hierarchy
    const [repo] = await db
      .insert(repos)
      .values({
        filePath: "/test/cascade-delete-repo",
        name: "Cascade Delete Test Repo",
      })
      .returning();

    if (!repo) throw new Error("Failed to create test repo");

    // Create a version
    const [version] = await db
      .insert(repoVersions)
      .values({
        repoId: repo.id,
        name: "v1.0",
      })
      .returning();

    if (!version) throw new Error("Failed to create test version");

    // Create a section
    const [section] = await db
      .insert(sections)
      .values({
        repoId: repo.id,
        repoVersionId: version.id,
        path: "001-test-section",
        order: 1,
      })
      .returning();

    if (!section) throw new Error("Failed to create test section");

    // Create a lesson
    const [lesson] = await db
      .insert(lessons)
      .values({
        sectionId: section.id,
        path: "001-test-lesson",
        order: 1,
      })
      .returning();

    if (!lesson) throw new Error("Failed to create test lesson");

    // Create a video
    const [video] = await db
      .insert(videos)
      .values({
        lessonId: lesson.id,
        path: "/test/video.mp4",
        originalFootagePath: "/test/original.mp4",
      })
      .returning();

    if (!video) throw new Error("Failed to create test video");

    // Create a clip
    const [clip] = await db
      .insert(clips)
      .values({
        videoId: video.id,
        videoFilename: "video.mp4",
        sourceStartTime: 0,
        sourceEndTime: 10,
        order: "a0",
        text: "Test clip",
      })
      .returning();

    if (!clip) throw new Error("Failed to create test clip");

    // Verify all entities exist
    expect(await db.query.repos.findFirst({ where: eq(repos.id, repo.id) })).toBeTruthy();
    expect(await db.query.repoVersions.findFirst({ where: eq(repoVersions.id, version.id) })).toBeTruthy();
    expect(await db.query.sections.findFirst({ where: eq(sections.id, section.id) })).toBeTruthy();
    expect(await db.query.lessons.findFirst({ where: eq(lessons.id, lesson.id) })).toBeTruthy();
    expect(await db.query.videos.findFirst({ where: eq(videos.id, video.id) })).toBeTruthy();
    expect(await db.query.clips.findFirst({ where: eq(clips.id, clip.id) })).toBeTruthy();

    // Delete the repo using DBService
    await Effect.gen(function* () {
      const dbService = yield* DBService;
      yield* dbService.deleteRepo(repo.id);
    }).pipe(Effect.provide(DBService.Default), Effect.runPromise);

    // Verify all entities are deleted
    expect(await db.query.repos.findFirst({ where: eq(repos.id, repo.id) })).toBeUndefined();
    expect(await db.query.repoVersions.findFirst({ where: eq(repoVersions.id, version.id) })).toBeUndefined();
    expect(await db.query.sections.findFirst({ where: eq(sections.id, section.id) })).toBeUndefined();
    expect(await db.query.lessons.findFirst({ where: eq(lessons.id, lesson.id) })).toBeUndefined();
    expect(await db.query.videos.findFirst({ where: eq(videos.id, video.id) })).toBeUndefined();
    expect(await db.query.clips.findFirst({ where: eq(clips.id, clip.id) })).toBeUndefined();
  });
});
