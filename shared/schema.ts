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

// Budget category
export const budgetCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Category name is required"),
  yearlyBudget: z.number().nonnegative("Budget must be non-negative"),
  monthlyBudget: z.number().nonnegative("Budget must be non-negative").optional(),
});

export type BudgetCategory = z.infer<typeof budgetCategorySchema>;

export const insertBudgetCategorySchema = budgetCategorySchema.omit({ id: true });
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;

// Settings stored in settings.json
export const settingsSchema = z.object({
  budgetCategories: z.array(budgetCategorySchema),
  currentYear: z.number(),
});

export type Settings = z.infer<typeof settingsSchema>;

// GitHub configuration
export const githubConfigSchema = z.object({
  token: z.string().min(1, "Token is required"),
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
});

export type GitHubConfig = z.infer<typeof githubConfigSchema>;

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
