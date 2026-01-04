import type { Transaction, Settings } from "@shared/schema";

const STORAGE_KEYS = {
  TRANSACTIONS: "accounting_transactions",
  SETTINGS: "accounting_settings",
};

const DEFAULT_SETTINGS: Settings = {
  budgetCategories: [
    { id: "1", name: "수련회", yearlyBudget: 0 },
    { id: "2", name: "행사비", yearlyBudget: 0 },
    { id: "3", name: "간식비", yearlyBudget: 0 },
    { id: "4", name: "교재비", yearlyBudget: 0 },
    { id: "5", name: "기타", yearlyBudget: 0 },
  ],
  currentYear: new Date().getFullYear(),
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Transactions
export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function addTransaction(transaction: Omit<Transaction, "id">): Transaction {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
  };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
}

export function updateTransaction(transaction: Transaction): boolean {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === transaction.id);
  if (index === -1) return false;
  transactions[index] = transaction;
  saveTransactions(transactions);
  return true;
}

export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);
  if (filtered.length === transactions.length) return false;
  saveTransactions(filtered);
  return true;
}

// Settings
export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!stored) return DEFAULT_SETTINGS;
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Receipt storage (Base64 in localStorage)
export function saveReceipt(filename: string, base64Data: string): string {
  if (typeof window === "undefined") return "";
  const key = `receipt_${filename}`;
  localStorage.setItem(key, base64Data);
  return key;
}

export function getReceipt(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

export function deleteReceipt(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// Export/Import data as JSON
export function exportData(): string {
  const data = {
    transactions: getTransactions(),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.transactions) {
      saveTransactions(data.transactions);
    }
    if (data.settings) {
      saveSettings(data.settings);
    }
    return true;
  } catch {
    return false;
  }
}

// Export as CSV
export function exportTransactionsCSV(): string {
  const transactions = getTransactions();
  const headers = ["날짜", "제목", "금액", "분류", "유형", "메모"];
  const lines = [headers.join(",")];

  for (const t of transactions) {
    const values = [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount.toString(),
      t.category,
      t.type === "income" ? "수입" : "지출",
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ];
    lines.push(values.join(","));
  }

  return lines.join("\n");
}
