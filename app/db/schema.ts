import { sql } from "drizzle-orm";
import {
  integer,
  pgTableCreator,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `course-video-manager_${name}`
);

export const repos = createTable("repo", {
  id: serial("id").primaryKey(),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const sections = createTable("section", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  order: integer("order").notNull(),
});

export const lessons = createTable("lesson", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  order: integer("order").notNull(),
});

export const videos = createTable("video", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }),
});

// export const chats = createTable("chat", {
//   id: varchar("id", { length: 255 })
//     .notNull()
//     .primaryKey()
//     .$defaultFn(() => crypto.randomUUID()),
//   userId: varchar("user_id", { length: 255 })
//     .notNull()
//     .references(() => users.id),
//   title: varchar("title", { length: 255 }).notNull(),
//   createdAt: timestamp("created_at", {
//     mode: "date",
//     withTimezone: true,
//   })
//     .notNull()
//     .default(sql`CURRENT_TIMESTAMP`),
//   updatedAt: timestamp("updated_at", {
//     mode: "date",
//     withTimezone: true,
//   })
//     .notNull()
//     .default(sql`CURRENT_TIMESTAMP`),
// });

// export const chatsRelations = relations(chats, ({ one, many }) => ({
//   user: one(users, { fields: [chats.userId], references: [users.id] }),
//   messages: many(messages),
// }));

// export const messages = createTable("message", {
//   id: varchar("id", { length: 255 })
//     .notNull()
//     .primaryKey()
//     .$defaultFn(() => crypto.randomUUID()),
//   chatId: varchar("chat_id", { length: 255 })
//     .notNull()
//     .references(() => chats.id),
//   role: varchar("role", { length: 255 }).notNull(),
//   parts: json("parts").notNull(),
//   annotations: json("annotations"),
//   order: integer("order").notNull(),
//   createdAt: timestamp("created_at", {
//     mode: "date",
//     withTimezone: true,
//   })
//     .notNull()
//     .default(sql`CURRENT_TIMESTAMP`),
// });

// export const messagesRelations = relations(messages, ({ one }) => ({
//   chat: one(chats, { fields: [messages.chatId], references: [chats.id] }),
// }));

// export declare namespace DB {
//   export type User = InferSelectModel<typeof users>;
//   export type NewUser = InferInsertModel<typeof users>;

//   export type Account = InferSelectModel<typeof accounts>;
//   export type NewAccount = InferInsertModel<typeof accounts>;

//   export type Session = InferSelectModel<typeof sessions>;
//   export type NewSession = InferInsertModel<typeof sessions>;

//   export type VerificationToken = InferSelectModel<typeof verificationTokens>;
//   export type NewVerificationToken = InferInsertModel<
//     typeof verificationTokens
//   >;

//   export type Chat = InferSelectModel<typeof chats>;
//   export type NewChat = InferInsertModel<typeof chats>;

//   export type Message = InferSelectModel<typeof messages>;
//   export type NewMessage = InferInsertModel<typeof messages>;
// }
