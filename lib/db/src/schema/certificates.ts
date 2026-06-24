import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  issuer: text("issuer").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"),
  category: text("category").notNull().default("Course"),
  viewCount: integer("view_count").notNull().default(0),
  shareToken: text("share_token"),
  uploadedByClerkId: text("uploaded_by_clerk_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCertificateSchema = createInsertSchema(certificatesTable).omit({ id: true, viewCount: true, createdAt: true });
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificatesTable.$inferSelect;
