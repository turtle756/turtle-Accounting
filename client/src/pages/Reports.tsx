import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useData } from "@/contexts/DataContext";
import type { CategorySpending, Transaction } from "@shared/schema";
import { INCOME_CATEGORIES } from "@shared/schema";

const MONTHS = [
  { value: "1", label: "1월" },
  { value: "2", label: "2월" },
  { value: "3", label: "3월" },
  { value: "4", label: "4월" },
  { value: "5", label: "5월" },
  { value: "6", label: "6월" },
  { value: "7", label: "7월" },
  { value: "8", label: "8월" },
  { value: "9", label: "9월" },
  { value: "10", label: "10월" },
  { value: "11", label: "11월" },
  { value: "12", label: "12월" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

function SpendingBar({ category }: { category: CategorySpending }) {
  const isOverBudget = category.budget > 0 && category.spent > category.budget;
  const percentage = category.budget > 0
    ? Math.min(100, (category.spent / category.budget) * 100)
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{category.category}</span>
        <span className="text-muted-foreground tabular-nums">
          {formatCurrency(category.spent)}
          {category.budget > 0 && (
            <span className="text-xs ml-1">
              / {formatCurrency(category.budget)}
            </span>
          )}
        </span>
      </div>
      {category.budget > 0 && (
        <div className="relative">
          <Progress
            value={percentage}
            className={`h-3 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
          />
          <span
            className={`absolute right-0 top-0 -translate-y-full text-xs ${
              isOverBudget ? "text-red-600" : "text-muted-foreground"
            }`}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

function PrintableReport({
  month,
  year,
  incomeByCategory,
  expenseByCategory,
  totalIncome,
  totalExpense,
  balance,
  transactions,
}: {
  month: number;
  year: number;
  incomeByCategory: CategorySpending[];
  expenseByCategory: CategorySpending[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
}) {
  const monthName = `${month}월`;

  return (
    <div className="print-report bg-white text-black p-8 max-w-4xl mx-auto">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-report, .print-report * { visibility: visible; }
          .print-report { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 20mm; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">회계 보고서</h1>
        <h2 className="text-lg">{year}년 {monthName} 월간 결산</h2>
        <p className="text-sm text-gray-600 mt-2">
          작성일: {format(new Date(), "yyyy년 MM월 dd일")}
        </p>
      </div>

      <Separator className="my-6" />

      {/* Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">1. 월간 요약</h3>
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium">총 수입</td>
              <td className="py-2 text-right tabular-nums text-green-700">
                {formatCurrency(totalIncome)}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">총 지출</td>
              <td className="py-2 text-right tabular-nums text-red-700">
                {formatCurrency(totalExpense)}
              </td>
            </tr>
            <tr className="font-bold">
              <td className="py-2">잔액</td>
              <td className={`py-2 text-right tabular-nums ${balance >= 0 ? "text-green-700" : "text-red-700"}`}>
                {formatCurrency(balance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Income by Category */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">2. 수입 내역</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 text-left">항목</th>
              <th className="py-2 text-right">금액</th>
            </tr>
          </thead>
          <tbody>
            {incomeByCategory.map((cat) => (
              <tr key={cat.category} className="border-b">
                <td className="py-2">{cat.category}</td>
                <td className="py-2 text-right tabular-nums">
                  {formatCurrency(cat.spent)}
                </td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-50">
              <td className="py-2">합계</td>
              <td className="py-2 text-right tabular-nums">
                {formatCurrency(totalIncome)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Expense by Category */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">3. 지출 내역</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 text-left">항목</th>
              <th className="py-2 text-right">예산</th>
              <th className="py-2 text-right">지출</th>
              <th className="py-2 text-right">잔여</th>
            </tr>
          </thead>
          <tbody>
            {expenseByCategory.map((cat) => {
              const remaining = cat.budget - cat.spent;
              return (
                <tr key={cat.category} className="border-b">
                  <td className="py-2">{cat.category}</td>
                  <td className="py-2 text-right tabular-nums">
                    {formatCurrency(cat.budget)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatCurrency(cat.spent)}
                  </td>
                  <td className={`py-2 text-right tabular-nums ${remaining < 0 ? "text-red-700" : ""}`}>
                    {formatCurrency(remaining)}
                  </td>
                </tr>
              );
            })}
            <tr className="font-bold bg-gray-50">
              <td className="py-2">합계</td>
              <td className="py-2 text-right tabular-nums">
                {formatCurrency(expenseByCategory.reduce((s, c) => s + c.budget, 0))}
              </td>
              <td className="py-2 text-right tabular-nums">
                {formatCurrency(totalExpense)}
              </td>
              <td className="py-2 text-right tabular-nums">
                {formatCurrency(expenseByCategory.reduce((s, c) => s + c.budget, 0) - totalExpense)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Transaction List */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">4. 거래 상세 내역</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 text-left">날짜</th>
              <th className="py-2 text-left">내용</th>
              <th className="py-2 text-left">분류</th>
              <th className="py-2 text-right">수입</th>
              <th className="py-2 text-right">지출</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-1 tabular-nums">{t.date}</td>
                <td className="py-1">{t.title}</td>
                <td className="py-1">{t.category}</td>
                <td className="py-1 text-right tabular-nums text-green-700">
                  {t.type === "income" ? formatCurrency(t.amount) : ""}
                </td>
                <td className="py-1 text-right tabular-nums text-red-700">
                  {t.type === "expense" ? formatCurrency(t.amount) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600">담당자: _________________</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">확인자: _________________</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const { transactions, settings } = useData();
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [showPrintView, setShowPrintView] = useState(false);

  const month = parseInt(selectedMonth);
  const year = settings.currentYear;

  const monthlyData = useMemo(() => {
    const monthTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate.getMonth() + 1 === month && txDate.getFullYear() === year;
    });

    // Calculate income by category
    const incomeByCategory: CategorySpending[] = INCOME_CATEGORIES.map((cat) => {
      const spent = monthTransactions
        .filter((t) => t.type === "income" && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0);
      return { category: cat, spent, budget: 0, percentage: 0 };
    }).filter((c) => c.spent > 0);

    // Calculate expense by category
    const expenseByCategory: CategorySpending[] = settings.budgetCategories.map(
      (cat) => {
        const spent = monthTransactions
          .filter((t) => t.type === "expense" && t.category === cat.name)
          .reduce((sum, t) => sum + t.amount, 0);
        const monthlyBudget = cat.yearlyBudget / 12;
        return {
          category: cat.name,
          spent,
          budget: monthlyBudget,
          percentage: monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0,
        };
      }
    );

    const totalIncome = incomeByCategory.reduce((s, c) => s + c.spent, 0);
    const totalExpense = expenseByCategory.reduce((s, c) => s + c.spent, 0);

    return {
      transactions: monthTransactions.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      incomeByCategory,
      expenseByCategory,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions, settings, month, year]);

  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  if (showPrintView) {
    return (
      <PrintableReport
        month={month}
        year={year}
        incomeByCategory={monthlyData.incomeByCategory}
        expenseByCategory={monthlyData.expenseByCategory}
        totalIncome={monthlyData.totalIncome}
        totalExpense={monthlyData.totalExpense}
        balance={monthlyData.balance}
        transactions={monthlyData.transactions}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-reports-title">
            보고서
          </h1>
          <p className="text-muted-foreground">
            월간 재정 요약 및 분석
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32" data-testid="select-month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handlePrint}
            data-testid="button-print"
          >
            <Printer className="w-4 h-4" />
            인쇄
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 수입
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-2xl font-bold tabular-nums text-green-600"
              data-testid="text-month-income"
            >
              {formatCurrency(monthlyData.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 지출
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-2xl font-bold tabular-nums text-red-600"
              data-testid="text-month-expense"
            >
              {formatCurrency(monthlyData.totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              잔액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold tabular-nums ${
                monthlyData.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
              data-testid="text-month-balance"
            >
              {formatCurrency(monthlyData.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Breakdown */}
      {monthlyData.incomeByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">수입 분류별 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {monthlyData.incomeByCategory.map((cat) => (
              <SpendingBar key={cat.category} category={cat} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">지출 대비 예산</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {monthlyData.expenseByCategory.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              지출 분류가 정의되지 않았습니다. 예산 설정에서 분류를 추가하세요.
            </p>
          ) : (
            monthlyData.expenseByCategory.map((cat) => (
              <SpendingBar key={cat.category} category={cat} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            거래 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            이번 달 총 {monthlyData.transactions.length}건의 거래
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>수입 건수:</span>
              <span className="font-medium">
                {monthlyData.transactions.filter((t) => t.type === "income").length}건
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>지출 건수:</span>
              <span className="font-medium">
                {monthlyData.transactions.filter((t) => t.type === "expense").length}건
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>영수증 첨부:</span>
              <span className="font-medium">
                {monthlyData.transactions.filter((t) => t.receiptPath).length}건
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
