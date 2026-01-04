import { z } from "zod";

// Income categories (fixed)
export const INCOME_CATEGORIES = [
  "전년이월",
  "교회보조",
  "헌신예배",
  "회비",
  "찬조",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

// Transaction type
export const transactionSchema = z.object({
  id: z.string(),
  date: z.string(), // YYYY-MM-DD format
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["income", "expense"]),
  notes: z.string().optional(),
  receiptPath: z.string().optional(), // Path in /receipts folder
});

export type Transaction = z.infer<typeof transactionSchema>;

export const insertTransactionSchema = transactionSchema.omit({ id: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Budget category with date range
export const budgetCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Category name is required"),
  yearlyBudget: z.number().nonnegative("Budget must be non-negative"),
  startDate: z.string().optional(), // YYYY-MM-DD
  endDate: z.string().optional(), // YYYY-MM-DD
});

export type BudgetCategory = z.infer<typeof budgetCategorySchema>;

export const insertBudgetCategorySchema = budgetCategorySchema.omit({ id: true });
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;

// Database info (year-based or custom)
export const databaseInfoSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g., "2025", "2026", or custom name
  isYear: z.boolean(), // true if this is a year-based database
  year: z.number().optional(), // Only for year-based databases
});

export type DatabaseInfo = z.infer<typeof databaseInfoSchema>;

// Settings stored per database
export const settingsSchema = z.object({
  budgetCategories: z.array(budgetCategorySchema),
  fiscalYear: z.number().optional(), // For year databases
});

export type Settings = z.infer<typeof settingsSchema>;

// App-wide configuration
export const appConfigSchema = z.object({
  databases: z.array(databaseInfoSchema),
  currentDatabaseId: z.string(),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

// Monthly summary for dashboard
export interface MonthlySummary {
  month: number;
  income: number;
  expense: number;
  balance: number;
  budgetUsed: number;
  budgetTotal: number;
}

// Yearly summary for dashboard
export interface YearlySummary {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  monthlyData: MonthlySummary[];
}

// Category spending for reports
export interface CategorySpending {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
}
