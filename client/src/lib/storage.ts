import type { Transaction, Settings, DatabaseInfo, AppConfig } from "@shared/schema";

const STORAGE_KEYS = {
  APP_CONFIG: "accounting_config",
  TRANSACTIONS_PREFIX: "accounting_transactions_",
  SETTINGS_PREFIX: "accounting_settings_",
};

const DEFAULT_SETTINGS: Settings = {
  budgetCategories: [
    { id: "1", name: "수련회", yearlyBudget: 0 },
    { id: "2", name: "행사비", yearlyBudget: 0 },
    { id: "3", name: "간식비", yearlyBudget: 0 },
    { id: "4", name: "교재비", yearlyBudget: 0 },
    { id: "5", name: "기타", yearlyBudget: 0 },
  ],
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Get current year
function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Initialize default databases (2025, 2026, and current year)
function getDefaultDatabases(): DatabaseInfo[] {
  const currentYear = getCurrentYear();
  const years = new Set([2025, 2026, currentYear]);
  
  return Array.from(years).sort().map((year) => ({
    id: `year_${year}`,
    name: `${year}`,
    isYear: true,
    year,
  }));
}

function getDefaultConfig(): AppConfig {
  const currentYear = getCurrentYear();
  return {
    databases: getDefaultDatabases(),
    currentDatabaseId: `year_${currentYear}`,
  };
}

// App Config
export function getAppConfig(): AppConfig {
  if (typeof window === "undefined") return getDefaultConfig();
  const stored = localStorage.getItem(STORAGE_KEYS.APP_CONFIG);
  if (!stored) {
    const defaultConfig = getDefaultConfig();
    saveAppConfig(defaultConfig);
    return defaultConfig;
  }
  try {
    const config = JSON.parse(stored) as AppConfig;
    // Ensure current year database exists
    const currentYear = getCurrentYear();
    const currentYearDb = config.databases.find(
      (db) => db.isYear && db.year === currentYear
    );
    if (!currentYearDb) {
      config.databases.push({
        id: `year_${currentYear}`,
        name: `${currentYear}`,
        isYear: true,
        year: currentYear,
      });
      config.databases.sort((a, b) => {
        if (a.isYear && b.isYear) return (a.year || 0) - (b.year || 0);
        if (a.isYear) return -1;
        if (b.isYear) return 1;
        return a.name.localeCompare(b.name);
      });
      saveAppConfig(config);
    }
    return config;
  } catch {
    return getDefaultConfig();
  }
}

export function saveAppConfig(config: AppConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(config));
}

export function addDatabase(name: string, isYear: boolean, year?: number): DatabaseInfo {
  const config = getAppConfig();
  const id = isYear ? `year_${year}` : `custom_${generateId()}`;
  
  // Check if already exists
  const existing = config.databases.find((db) => db.id === id);
  if (existing) return existing;
  
  const newDb: DatabaseInfo = { id, name, isYear, year };
  config.databases.push(newDb);
  config.databases.sort((a, b) => {
    if (a.isYear && b.isYear) return (a.year || 0) - (b.year || 0);
    if (a.isYear) return -1;
    if (b.isYear) return 1;
    return a.name.localeCompare(b.name);
  });
  saveAppConfig(config);
  return newDb;
}

export function deleteDatabase(id: string): boolean {
  const config = getAppConfig();
  const index = config.databases.findIndex((db) => db.id === id);
  if (index === -1) return false;
  
  config.databases.splice(index, 1);
  
  // If deleting current database, switch to first available
  if (config.currentDatabaseId === id && config.databases.length > 0) {
    config.currentDatabaseId = config.databases[0].id;
  }
  
  saveAppConfig(config);
  
  // Also delete associated data
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS_PREFIX + id);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS_PREFIX + id);
  
  return true;
}

export function setCurrentDatabase(id: string): void {
  const config = getAppConfig();
  config.currentDatabaseId = id;
  saveAppConfig(config);
}

export function getCurrentDatabaseId(): string {
  return getAppConfig().currentDatabaseId;
}

// Transactions (per database)
export function getTransactions(databaseId?: string): Transaction[] {
  if (typeof window === "undefined") return [];
  const dbId = databaseId || getCurrentDatabaseId();
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS_PREFIX + dbId);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[], databaseId?: string): void {
  if (typeof window === "undefined") return;
  const dbId = databaseId || getCurrentDatabaseId();
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS_PREFIX + dbId, JSON.stringify(transactions));
}

export function addTransaction(transaction: Omit<Transaction, "id">, databaseId?: string): Transaction {
  const dbId = databaseId || getCurrentDatabaseId();
  const transactions = getTransactions(dbId);
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
  };
  transactions.push(newTransaction);
  saveTransactions(transactions, dbId);
  return newTransaction;
}

export function updateTransaction(transaction: Transaction, databaseId?: string): boolean {
  const dbId = databaseId || getCurrentDatabaseId();
  const transactions = getTransactions(dbId);
  const index = transactions.findIndex((t) => t.id === transaction.id);
  if (index === -1) return false;
  transactions[index] = transaction;
  saveTransactions(transactions, dbId);
  return true;
}

export function deleteTransaction(id: string, databaseId?: string): boolean {
  const dbId = databaseId || getCurrentDatabaseId();
  const transactions = getTransactions(dbId);
  const filtered = transactions.filter((t) => t.id !== id);
  if (filtered.length === transactions.length) return false;
  saveTransactions(filtered, dbId);
  return true;
}

// Settings (per database)
export function getSettings(databaseId?: string): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const dbId = databaseId || getCurrentDatabaseId();
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS_PREFIX + dbId);
  if (!stored) return DEFAULT_SETTINGS;
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings, databaseId?: string): void {
  if (typeof window === "undefined") return;
  const dbId = databaseId || getCurrentDatabaseId();
  localStorage.setItem(STORAGE_KEYS.SETTINGS_PREFIX + dbId, JSON.stringify(settings));
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

// Export/Import data as JSON (all databases)
export function exportData(): string {
  const config = getAppConfig();
  const allData: Record<string, { transactions: Transaction[]; settings: Settings }> = {};
  
  for (const db of config.databases) {
    allData[db.id] = {
      transactions: getTransactions(db.id),
      settings: getSettings(db.id),
    };
  }
  
  const data = {
    config,
    databases: allData,
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.config) {
      saveAppConfig(data.config);
    }
    
    if (data.databases) {
      for (const [dbId, dbData] of Object.entries(data.databases)) {
        const { transactions, settings } = dbData as { transactions: Transaction[]; settings: Settings };
        if (transactions) {
          saveTransactions(transactions, dbId);
        }
        if (settings) {
          saveSettings(settings, dbId);
        }
      }
    }
    
    // Legacy format support
    if (data.transactions && !data.databases) {
      const currentDbId = getCurrentDatabaseId();
      saveTransactions(data.transactions, currentDbId);
    }
    if (data.settings && !data.databases) {
      const currentDbId = getCurrentDatabaseId();
      saveSettings(data.settings, currentDbId);
    }
    
    return true;
  } catch {
    return false;
  }
}

// Export as CSV (current database)
export function exportTransactionsCSV(databaseId?: string): string {
  const transactions = getTransactions(databaseId);
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
