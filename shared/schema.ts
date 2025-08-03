import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  website: text("website").notNull(),
  linkedin: text("linkedin"),
  totalEmails: integer("total_emails").notNull().default(0),
  totalPeople: integer("total_people").notNull().default(0),
  lastAttempt: text("last_attempt"),
  hasOpened: boolean("has_opened").notNull().default(false),
  openCount: integer("open_count").notNull().default(0),
  hasClicked: boolean("has_clicked").notNull().default(false),
  clickCount: integer("click_count").notNull().default(0),
  resumeOpenCount: integer("resume_open_count").notNull().default(0),
  hasResponded: boolean("has_responded").notNull().default(false),
  decision: text("decision"), // "yes", "no", or null for pending
});

export const people = pgTable("people", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  position: text("position"),
  linkedin: text("linkedin"),
  attempts: integer("attempts").notNull().default(0),
  lastEmailDate: text("last_email_date"),
  opened: boolean("opened").notNull().default(false),
  openCount: integer("open_count").notNull().default(0),
  clicked: boolean("clicked").notNull().default(false),
  clickCount: integer("click_count").notNull().default(0),
  resumeOpened: boolean("resume_opened").notNull().default(false),
  resumeOpenCount: integer("resume_open_count").notNull().default(0),
  responded: boolean("responded").notNull().default(false),
});

export const emailStats = pgTable("email_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personId: varchar("person_id").notNull(),
  companyId: varchar("company_id").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  sentDate: text("sent_date").notNull(),
  openCount: integer("open_count").notNull().default(0),
  clickCount: integer("click_count").notNull().default(0),
  resumeOpenCount: integer("resume_open_count").notNull().default(0),
  responded: boolean("responded").notNull().default(false),
  subject: text("subject").notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
});

export const insertPersonSchema = createInsertSchema(people).omit({
  id: true,
});

export const insertEmailStatSchema = createInsertSchema(emailStats).omit({
  id: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Person = typeof people.$inferSelect;
export type InsertEmailStat = z.infer<typeof insertEmailStatSchema>;
export type EmailStat = typeof emailStats.$inferSelect;
