import { sql } from "drizzle-orm";
import { integer, text, real, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  totalShares: integer("total_shares").notNull(),
  price: real("price").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
});

export const applicants = sqliteTable("applicants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  pan: text("pan").notNull().unique(),
  dematNo: text("demat_no").notNull().unique(),
});

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicantId: integer("applicant_id").notNull().references(() => applicants.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  sharesReq: integer("shares_req").notNull(),
  amount: real("amount").notNull(),
});

export const allotments = sqliteTable("allotments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationId: integer("application_id").notNull().unique().references(() => applications.id),
  sharesAlloted: integer("shares_alloted").notNull(),
});

export const refunds = sqliteTable("refunds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  allotmentId: integer("allotment_id").notNull().unique().references(() => allotments.id),
  amount: real("amount").notNull(),
});

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });
export const insertApplicantSchema = createInsertSchema(applicants).omit({ id: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true });
export const insertAllotmentSchema = createInsertSchema(allotments).omit({ id: true });
export const insertRefundSchema = createInsertSchema(refunds).omit({ id: true });

// Enhanced validation schemas
export const applicationFormSchema = insertApplicationSchema.extend({
  name: z.string().min(1, "Name is required"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  dematNo: z.string().min(16, "Demat number must be at least 16 characters"),
  sharesReq: z.number().min(1, "Must request at least 1 share"),
});

// Types
export type Company = typeof companies.$inferSelect;
export type Applicant = typeof applicants.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Allotment = typeof allotments.$inferSelect;
export type Refund = typeof refunds.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type InsertAllotment = z.infer<typeof insertAllotmentSchema>;
export type InsertRefund = z.infer<typeof insertRefundSchema>;

export type ApplicationForm = z.infer<typeof applicationFormSchema>;
