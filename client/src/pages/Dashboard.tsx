import { useMemo } from "react";
import { Link } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useData } from "@/contexts/DataContext";
import type { MonthlySummary, YearlySummary } from "@shared/schema";

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

function SummaryCard({
  title,
  amount,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  amount: number;
  icon: typeof TrendingUp;
  trend?: "up" | "down";
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-bold tabular-nums"
            data-testid={`text-${title}`}
          >
            {formatCurrency(amount)}
          </span>
          {trend && (
            <span
              className={`flex items-center text-xs ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MonthCard({ summary, month }: { summary: MonthlySummary; month: number }) {
  const budgetPercentage = summary.budgetTotal > 0
    ? Math.min(100, (summary.budgetUsed / summary.budgetTotal) * 100)
    : 0;
  const isOverBudget = summary.budgetUsed > summary.budgetTotal && summary.budgetTotal > 0;

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center justify-between gap-2">
          {MONTH_NAMES[month]}
          {summary.balance > 0 ? (
            <span className="text-xs text-green-600 font-normal">+{formatCurrency(summary.balance)}</span>
          ) : summary.balance < 0 ? (
            <span className="text-xs text-red-600 font-normal">{formatCurrency(summary.balance)}</span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">수입</span>
            <p className="font-medium text-green-600 tabular-nums">
              {formatCurrency(summary.income)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">지출</span>
            <p className="font-medium text-red-600 tabular-nums">
              {formatCurrency(summary.expense)}
            </p>
          </div>
        </div>
        {summary.budgetTotal > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>예산</span>
              <span className={isOverBudget ? "text-red-600" : ""}>
                {Math.round(budgetPercentage)}%
              </span>
            </div>
            <Progress
              value={budgetPercentage}
              className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-12" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { transactions, settings, isLoading } = useData();

  const yearlyData = useMemo((): YearlySummary => {
    const currentYear = settings.currentYear;
    const yearTransactions = transactions.filter((t) => {
      const year = new Date(t.date).getFullYear();
      return year === currentYear;
    });

    const monthlyData: MonthlySummary[] = [];
    const totalBudget = settings.budgetCategories.reduce(
      (sum, c) => sum + c.yearlyBudget,
      0
    );
    const monthlyBudget = totalBudget / 12;

    for (let month = 0; month < 12; month++) {
      const monthTransactions = yearTransactions.filter((t) => {
        return new Date(t.date).getMonth() === month;
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month,
        income,
        expense,
        balance: income - expense,
        budgetUsed: expense,
        budgetTotal: monthlyBudget,
      });
    }

    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);

    return {
      totalIncome,
      totalExpense,
      currentBalance: totalIncome - totalExpense,
      monthlyData,
    };
  }, [transactions, settings]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
            대시보드
          </h1>
          <p className="text-muted-foreground">
            {settings.currentYear}년 연간 현황
          </p>
        </div>
        <Link href="/input">
          <Button className="gap-2" data-testid="button-add-transaction">
            <PlusCircle className="w-4 h-4" />
            거래 추가
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="총 수입"
          amount={yearlyData.totalIncome}
          icon={TrendingUp}
          trend="up"
        />
        <SummaryCard
          title="총 지출"
          amount={yearlyData.totalExpense}
          icon={TrendingDown}
          trend="down"
        />
        <SummaryCard
          title="현재 잔액"
          amount={yearlyData.currentBalance}
          icon={Wallet}
          trend={yearlyData.currentBalance >= 0 ? "up" : "down"}
        />
      </div>

      {/* Monthly Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">월별 현황</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {yearlyData.monthlyData.map((summary, index) => (
            <MonthCard key={index} summary={summary} month={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
