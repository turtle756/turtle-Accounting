import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Transaction, Settings, DatabaseInfo, AppConfig } from "@shared/schema";
import {
  getTransactions,
  saveTransactions,
  getSettings,
  saveSettings,
  saveReceipt,
  getReceipt,
  deleteReceipt,
  exportData,
  importData,
  exportTransactionsCSV,
  getAppConfig,
  saveAppConfig,
  addDatabase,
  deleteDatabase as deleteDb,
  setCurrentDatabase,
  getCurrentDatabaseId,
} from "@/lib/storage";

interface DataContextValue {
  isLoading: boolean;
  transactions: Transaction[];
  settings: Settings;
  appConfig: AppConfig;
  currentDatabaseId: string;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateSettings: (settings: Settings) => void;
  saveReceiptImage: (file: File, filename: string) => Promise<string>;
  getReceiptImage: (key: string) => string | null;
  deleteReceiptImage: (key: string) => void;
  exportAllData: () => string;
  importAllData: (jsonString: string) => boolean;
  exportCSV: () => string;
  switchDatabase: (id: string) => void;
  createDatabase: (name: string, isYear: boolean, year?: number) => DatabaseInfo;
  removeDatabase: (id: string) => boolean;
  refreshData: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  budgetCategories: [
    { id: "1", name: "수련회", yearlyBudget: 0 },
    { id: "2", name: "행사비", yearlyBudget: 0 },
    { id: "3", name: "간식비", yearlyBudget: 0 },
    { id: "4", name: "교재비", yearlyBudget: 0 },
    { id: "5", name: "기타", yearlyBudget: 0 },
  ],
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [appConfig, setAppConfig] = useState<AppConfig>({ databases: [], currentDatabaseId: "" });
  const [currentDatabaseId, setCurrentDatabaseId] = useState("");

  const loadData = useCallback(() => {
    const config = getAppConfig();
    setAppConfig(config);
    setCurrentDatabaseId(config.currentDatabaseId);
    setTransactions(getTransactions(config.currentDatabaseId));
    setSettings(getSettings(config.currentDatabaseId));
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
    setIsLoading(false);
  }, [loadData]);

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleAddTransaction = useCallback((transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
    };
    setTransactions((prev) => {
      const updated = [...prev, newTransaction];
      saveTransactions(updated, currentDatabaseId);
      return updated;
    });
  }, [currentDatabaseId]);

  const handleUpdateTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => {
      const updated = prev.map((t) => (t.id === transaction.id ? transaction : t));
      saveTransactions(updated, currentDatabaseId);
      return updated;
    });
  }, [currentDatabaseId]);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const transaction = prev.find((t) => t.id === id);
      if (transaction?.receiptPath) {
        deleteReceipt(transaction.receiptPath);
      }
      const updated = prev.filter((t) => t.id !== id);
      saveTransactions(updated, currentDatabaseId);
      return updated;
    });
  }, [currentDatabaseId]);

  const handleUpdateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings, currentDatabaseId);
  }, [currentDatabaseId]);

  const handleSaveReceipt = useCallback(async (file: File, filename: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const key = saveReceipt(filename, base64);
        resolve(key);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleGetReceipt = useCallback((key: string): string | null => {
    return getReceipt(key);
  }, []);

  const handleDeleteReceipt = useCallback((key: string) => {
    deleteReceipt(key);
  }, []);

  const handleExportData = useCallback((): string => {
    return exportData();
  }, []);

  const handleImportData = useCallback((jsonString: string): boolean => {
    const success = importData(jsonString);
    if (success) {
      loadData();
    }
    return success;
  }, [loadData]);

  const handleExportCSV = useCallback((): string => {
    return exportTransactionsCSV(currentDatabaseId);
  }, [currentDatabaseId]);

  const handleSwitchDatabase = useCallback((id: string) => {
    setCurrentDatabase(id);
    setCurrentDatabaseId(id);
    setTransactions(getTransactions(id));
    setSettings(getSettings(id));
    const config = getAppConfig();
    setAppConfig(config);
  }, []);

  const handleCreateDatabase = useCallback((name: string, isYear: boolean, year?: number): DatabaseInfo => {
    const newDb = addDatabase(name, isYear, year);
    setAppConfig(getAppConfig());
    return newDb;
  }, []);

  const handleRemoveDatabase = useCallback((id: string): boolean => {
    const success = deleteDb(id);
    if (success) {
      loadData();
    }
    return success;
  }, [loadData]);

  return (
    <DataContext.Provider
      value={{
        isLoading,
        transactions,
        settings,
        appConfig,
        currentDatabaseId,
        addTransaction: handleAddTransaction,
        updateTransaction: handleUpdateTransaction,
        deleteTransaction: handleDeleteTransaction,
        updateSettings: handleUpdateSettings,
        saveReceiptImage: handleSaveReceipt,
        getReceiptImage: handleGetReceipt,
        deleteReceiptImage: handleDeleteReceipt,
        exportAllData: handleExportData,
        importAllData: handleImportData,
        exportCSV: handleExportCSV,
        switchDatabase: handleSwitchDatabase,
        createDatabase: handleCreateDatabase,
        removeDatabase: handleRemoveDatabase,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
