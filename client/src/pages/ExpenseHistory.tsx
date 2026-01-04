import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Camera,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { ReceiptModal } from "@/components/ReceiptModal";
import { TransactionForm } from "@/components/TransactionForm";
import type { Transaction } from "@shared/schema";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  onViewReceipt,
}: {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  onViewReceipt: (t: Transaction) => void;
}) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate" data-testid={`text-title-${transaction.id}`}>
                {transaction.title}
              </span>
              <Badge variant="secondary" className="text-xs shrink-0">
                {transaction.category}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{format(new Date(transaction.date), "yyyy-MM-dd")}</span>
              {transaction.notes && (
                <span className="truncate">{transaction.notes}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="font-semibold tabular-nums text-red-600" data-testid={`text-amount-${transaction.id}`}>
              -{formatCurrency(transaction.amount)}
            </span>
            <div className="flex gap-1">
              {transaction.receiptPath && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onViewReceipt(transaction)}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(transaction)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(transaction)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExpenseHistory() {
  const { transactions, settings, isLoading, deleteTransaction, getReceiptImage } = useData();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Transaction | null>(null);
  const [receiptView, setReceiptView] = useState<Transaction | null>(null);

  const expenseCategories = settings.budgetCategories.map((c) => c.name);

  const expenseTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .filter((t) => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (
            !t.title.toLowerCase().includes(query) &&
            !t.category.toLowerCase().includes(query) &&
            !(t.notes || "").toLowerCase().includes(query)
          ) {
            return false;
          }
        }
        if (categoryFilter !== "all" && t.category !== categoryFilter) {
          return false;
        }
        const txDate = new Date(t.date);
        if (dateFrom && txDate < dateFrom) return false;
        if (dateTo) {
          const endDate = new Date(dateTo);
          endDate.setHours(23, 59, 59, 999);
          if (txDate > endDate) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, categoryFilter, dateFrom, dateTo]);

  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleDelete = (transaction: Transaction) => {
    deleteTransaction(transaction.id);
    toast({
      title: "삭제 완료",
      description: `"${transaction.title}" 지출이 삭제되었습니다`,
    });
    setDeleteConfirm(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || dateFrom || dateTo;

  const getReceiptImageUrl = (path: string): string => {
    return getReceiptImage(path) || "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 pb-24 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-expense-history-title">
            지출 내역
          </h1>
          <p className="text-muted-foreground">
            총 {expenseTransactions.length}건 · {formatCurrency(totalExpense)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="지출 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                필터
                {hasActiveFilters && <Badge variant="secondary" className="ml-1">적용됨</Badge>}
                {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="w-4 h-4" />
                초기화
              </Button>
            )}
          </div>

          <CollapsibleContent className="mt-3">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">분류</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 분류</SelectItem>
                        {expenseCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">시작일</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          {dateFrom ? format(dateFrom, "yyyy-MM-dd") : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">종료일</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          {dateTo ? format(dateTo, "yyyy-MM-dd") : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dateTo} onSelect={setDateTo} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : expenseTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">지출 내역이 없습니다</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                필터 초기화
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>분류</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                    <TableHead>영수증</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="tabular-nums">
                        {format(new Date(transaction.date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{transaction.title}</span>
                          {transaction.notes && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {transaction.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold tabular-nums text-red-600">
                          <ArrowDownRight className="w-4 h-4 inline mr-1" />
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {transaction.receiptPath && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setReceiptView(transaction)}
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditTransaction(transaction)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteConfirm(transaction)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="md:hidden space-y-3">
            {expenseTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={setEditTransaction}
                onDelete={setDeleteConfirm}
                onViewReceipt={setReceiptView}
              />
            ))}
          </div>
        </>
      )}

      <Dialog open={!!editTransaction} onOpenChange={(open) => !open && setEditTransaction(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>지출 수정</DialogTitle>
          </DialogHeader>
          {editTransaction && (
            <TransactionForm editTransaction={editTransaction} onSuccess={() => setEditTransaction(null)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지출 삭제</DialogTitle>
            <DialogDescription>
              "{deleteConfirm?.title}" 지출을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>취소</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>삭제</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {receiptView && receiptView.receiptPath && (
        <ReceiptModal
          open={!!receiptView}
          onOpenChange={(open) => !open && setReceiptView(null)}
          imageUrl={getReceiptImageUrl(receiptView.receiptPath)}
          title={receiptView.title}
          date={receiptView.date}
        />
      )}
    </div>
  );
}
