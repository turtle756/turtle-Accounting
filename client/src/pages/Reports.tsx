import { useMemo } from "react";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useData } from "@/contexts/DataContext";
import { INCOME_CATEGORIES } from "@shared/schema";

const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월"
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Reports() {
  const { transactions, settings, appConfig, currentDatabaseId } = useData();

  const currentDatabase = appConfig.databases.find((db) => db.id === currentDatabaseId);
  const displayYear = currentDatabase?.year || new Date().getFullYear();

  const reportData = useMemo(() => {
    // Monthly breakdown
    const monthlyData = Array.from({ length: 12 }, (_, month) => {
      const monthTransactions = transactions.filter((t) => {
        return new Date(t.date).getMonth() === month;
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      // Expense by category
      const expenseByCategory = settings.budgetCategories.map((cat) => ({
        name: cat.name,
        amount: monthTransactions
          .filter((t) => t.type === "expense" && t.category === cat.name)
          .reduce((sum, t) => sum + t.amount, 0),
        budget: cat.yearlyBudget / 12,
      }));

      return {
        month,
        income,
        expense,
        balance: income - expense,
        expenseByCategory,
      };
    });

    // Income totals by category
    const incomeTotals = INCOME_CATEGORIES.map((cat) => ({
      name: cat,
      total: transactions
        .filter((t) => t.type === "income" && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0),
    })).filter((c) => c.total > 0);

    // Expense totals by category
    const expenseTotals = settings.budgetCategories.map((cat) => ({
      name: cat.name,
      budget: cat.yearlyBudget,
      spent: transactions
        .filter((t) => t.type === "expense" && t.category === cat.name)
        .reduce((sum, t) => sum + t.amount, 0),
    }));

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      monthlyData,
      incomeTotals,
      expenseTotals,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions, settings]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6 print:p-0 print:max-w-none">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-reports-title">
            연간 보고서
          </h1>
          <p className="text-muted-foreground">
            {displayYear}년 전체 회계 보고서
          </p>
        </div>
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

      {/* Printable Report */}
      <div className="print-area space-y-6">
        {/* Report Title */}
        <div className="text-center mb-8 hidden print:block">
          <h1 className="text-2xl font-bold mb-2">회계 보고서</h1>
          <h2 className="text-lg">{displayYear}년 연간 결산</h2>
          <p className="text-sm text-muted-foreground mt-2">
            작성일: {format(new Date(), "yyyy년 MM월 dd일")}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                연간 총 수입
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums text-green-600" data-testid="text-total-income">
                {formatCurrency(reportData.totalIncome)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                연간 총 지출
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums text-red-600" data-testid="text-total-expense">
                {formatCurrency(reportData.totalExpense)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                연간 잔액
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold tabular-nums ${
                  reportData.balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
                data-testid="text-total-balance"
              >
                {formatCurrency(reportData.balance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>월별 예산 현황 (1월~12월)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-2 px-2 text-left font-medium">월</th>
                    <th className="py-2 px-2 text-right font-medium">수입</th>
                    <th className="py-2 px-2 text-right font-medium">지출</th>
                    <th className="py-2 px-2 text-right font-medium">잔액</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthlyData.map((data, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-2 font-medium">{MONTH_NAMES[index]}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-green-600">
                        {formatCurrency(data.income)}
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-red-600">
                        {formatCurrency(data.expense)}
                      </td>
                      <td className={`py-2 px-2 text-right tabular-nums ${data.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(data.balance)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-muted/50">
                    <td className="py-2 px-2">합계</td>
                    <td className="py-2 px-2 text-right tabular-nums text-green-600">
                      {formatCurrency(reportData.totalIncome)}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-red-600">
                      {formatCurrency(reportData.totalExpense)}
                    </td>
                    <td className={`py-2 px-2 text-right tabular-nums ${reportData.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(reportData.balance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Income by Category */}
        <Card>
          <CardHeader>
            <CardTitle>수입 항목별 합계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-2 px-2 text-left font-medium">항목</th>
                    <th className="py-2 px-2 text-right font-medium">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.incomeTotals.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-muted-foreground">
                        수입 내역이 없습니다
                      </td>
                    </tr>
                  ) : (
                    <>
                      {reportData.incomeTotals.map((item) => (
                        <tr key={item.name} className="border-b">
                          <td className="py-2 px-2">{item.name}</td>
                          <td className="py-2 px-2 text-right tabular-nums text-green-600">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-muted/50">
                        <td className="py-2 px-2">수입 합계</td>
                        <td className="py-2 px-2 text-right tabular-nums text-green-600">
                          {formatCurrency(reportData.totalIncome)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Expense by Category */}
        <Card>
          <CardHeader>
            <CardTitle>지출 예산별 합계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-2 px-2 text-left font-medium">항목</th>
                    <th className="py-2 px-2 text-right font-medium">예산</th>
                    <th className="py-2 px-2 text-right font-medium">지출</th>
                    <th className="py-2 px-2 text-right font-medium">잔여</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.expenseTotals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        지출 분류가 정의되지 않았습니다
                      </td>
                    </tr>
                  ) : (
                    <>
                      {reportData.expenseTotals.map((item) => {
                        const remaining = item.budget - item.spent;
                        return (
                          <tr key={item.name} className="border-b">
                            <td className="py-2 px-2">{item.name}</td>
                            <td className="py-2 px-2 text-right tabular-nums">
                              {formatCurrency(item.budget)}
                            </td>
                            <td className="py-2 px-2 text-right tabular-nums text-red-600">
                              {formatCurrency(item.spent)}
                            </td>
                            <td className={`py-2 px-2 text-right tabular-nums ${remaining >= 0 ? "" : "text-red-600"}`}>
                              {formatCurrency(remaining)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="font-bold bg-muted/50">
                        <td className="py-2 px-2">지출 합계</td>
                        <td className="py-2 px-2 text-right tabular-nums">
                          {formatCurrency(reportData.expenseTotals.reduce((s, c) => s + c.budget, 0))}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-red-600">
                          {formatCurrency(reportData.totalExpense)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums">
                          {formatCurrency(
                            reportData.expenseTotals.reduce((s, c) => s + c.budget, 0) - reportData.totalExpense
                          )}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Final Summary */}
        <Card>
          <CardHeader>
            <CardTitle>최종 결산</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">총 수입</span>
                <span className="text-xl font-bold tabular-nums text-green-600">
                  {formatCurrency(reportData.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">총 지출</span>
                <span className="text-xl font-bold tabular-nums text-red-600">
                  {formatCurrency(reportData.totalExpense)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-muted/50 rounded-md px-3">
                <span className="text-lg font-bold">총 잔액</span>
                <span
                  className={`text-2xl font-bold tabular-nums ${
                    reportData.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(reportData.balance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Print Footer */}
        <div className="hidden print:block mt-12 pt-8 border-t">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground">담당자: _________________</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">확인자: _________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
