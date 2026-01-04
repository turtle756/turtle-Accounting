import { useState } from "react";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import type { BudgetCategory, Settings } from "@shared/schema";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Budget() {
  const { settings, updateSettings, isLoading } = useData();
  const { toast } = useToast();
  const [categories, setCategories] = useState<BudgetCategory[]>(
    settings.budgetCategories
  );
  const [currentYear, setCurrentYear] = useState(settings.currentYear);
  const [isSaving, setIsSaving] = useState(false);

  const totalYearlyBudget = categories.reduce((sum, c) => sum + c.yearlyBudget, 0);

  const handleAddCategory = () => {
    const newCategory: BudgetCategory = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      name: "",
      yearlyBudget: 0,
    };
    setCategories([...categories, newCategory]);
  };

  const handleUpdateCategory = (
    id: string,
    field: keyof BudgetCategory,
    value: string | number
  ) => {
    setCategories(
      categories.map((c) =>
        c.id === id
          ? {
              ...c,
              [field]: field === "yearlyBudget" ? Number(value) || 0 : value,
            }
          : c
      )
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleSave = async () => {
    // Validate
    const emptyNames = categories.filter((c) => !c.name.trim());
    if (emptyNames.length > 0) {
      toast({
        title: "입력 오류",
        description: "모든 분류에 이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const newSettings: Settings = {
      budgetCategories: categories,
      currentYear,
    };

    updateSettings(newSettings);

    toast({
      title: "저장 완료",
      description: "예산 설정이 저장되었습니다",
    });

    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-budget-title">
            예산 설정
          </h1>
          <p className="text-muted-foreground">
            지출 분류를 정의하고 연간 예산 목표를 설정하세요
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
          data-testid="button-save"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          저장
        </Button>
      </div>

      {/* Year Setting */}
      <Card>
        <CardHeader>
          <CardTitle>회계 연도</CardTitle>
          <CardDescription>
            현재 회계 연도를 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="w-32"
              data-testid="input-year"
            />
            <span className="text-muted-foreground">년</span>
          </div>
        </CardContent>
      </Card>

      {/* Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle>예산 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">연간 총 예산</p>
              <p
                className="text-2xl font-bold tabular-nums"
                data-testid="text-total-budget"
              >
                {formatCurrency(totalYearlyBudget)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">월 평균</p>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(totalYearlyBudget / 12)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>지출 분류</CardTitle>
            <CardDescription>
              지출 추적을 위한 분류와 예산을 추가하세요
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCategory}
            className="gap-2 shrink-0"
            data-testid="button-add-category"
          >
            <Plus className="w-4 h-4" />
            분류 추가
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>아직 정의된 분류가 없습니다.</p>
              <Button
                variant="link"
                onClick={handleAddCategory}
                className="mt-2"
              >
                첫 번째 분류 추가
              </Button>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {categories.map((category, index) => (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="border rounded-md px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4 gap-4">
                      <span className="font-medium">
                        {category.name || `분류 ${index + 1}`}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatCurrency(category.yearlyBudget)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            분류명
                          </label>
                          <Input
                            value={category.name}
                            onChange={(e) =>
                              handleUpdateCategory(
                                category.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="분류명 입력"
                            data-testid={`input-category-name-${category.id}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            연간 예산 (원)
                          </label>
                          <Input
                            type="number"
                            value={category.yearlyBudget || ""}
                            onChange={(e) =>
                              handleUpdateCategory(
                                category.id,
                                "yearlyBudget",
                                e.target.value
                              )
                            }
                            placeholder="0"
                            data-testid={`input-category-budget-${category.id}`}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-sm text-muted-foreground">
                          월별: {formatCurrency(category.yearlyBudget / 12)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive gap-2"
                          onClick={() => handleDeleteCategory(category.id)}
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
