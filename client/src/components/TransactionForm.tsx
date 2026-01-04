import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { INCOME_CATEGORIES } from "@shared/schema";
import type { Transaction } from "@shared/schema";

const formSchema = z.object({
  date: z.date({ required_error: "날짜를 선택하세요" }),
  title: z.string().min(1, "제목을 입력하세요"),
  amount: z.string().min(1, "금액을 입력하세요").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "금액은 양수여야 합니다"
  ),
  category: z.string().min(1, "분류를 선택하세요"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  editTransaction?: Transaction;
  onSuccess?: () => void;
}

export function TransactionForm({ editTransaction, onSuccess }: TransactionFormProps) {
  const [activeTab, setActiveTab] = useState<"income" | "expense">(
    editTransaction?.type || "expense"
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(
    editTransaction?.receiptPath || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { settings, addTransaction, updateTransaction, saveReceiptImage, getReceiptImage } = useData();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: editTransaction ? new Date(editTransaction.date) : new Date(),
      title: editTransaction?.title || "",
      amount: editTransaction?.amount?.toString() || "",
      category: editTransaction?.category || "",
      notes: editTransaction?.notes || "",
    },
  });

  const expenseCategories = settings.budgetCategories.map((c) => c.name);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      let receiptPath = editTransaction?.receiptPath;

      // Save receipt if new file selected
      if (receiptFile) {
        const dateStr = format(values.date, "yyyyMMdd");
        const filename = `${dateStr}_${values.title.replace(/[^a-zA-Z0-9가-힣]/g, "_")}`;
        receiptPath = await saveReceiptImage(receiptFile, filename);
      } else if (!receiptPreview) {
        receiptPath = undefined;
      }

      const transactionData = {
        date: format(values.date, "yyyy-MM-dd"),
        title: values.title,
        amount: Number(values.amount),
        category: values.category,
        type: activeTab,
        notes: values.notes || "",
        receiptPath,
      };

      if (editTransaction) {
        updateTransaction({
          ...transactionData,
          id: editTransaction.id,
        });
        toast({
          title: "수정 완료",
          description: `"${values.title}" 거래가 수정되었습니다`,
        });
      } else {
        addTransaction(transactionData);
        toast({
          title: "추가 완료",
          description: `"${values.title}" 거래가 추가되었습니다`,
        });
      }

      form.reset({
        date: new Date(),
        title: "",
        amount: "",
        category: "",
        notes: "",
      });
      removeReceipt();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "오류",
        description: "저장에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const categories = activeTab === "income" ? [...INCOME_CATEGORIES] : expenseCategories;

  // Get stored receipt image for preview
  const getStoredReceiptPreview = () => {
    if (receiptPreview?.startsWith("data:")) {
      return receiptPreview;
    }
    if (receiptPreview) {
      return getReceiptImage(receiptPreview) || receiptPreview;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editTransaction ? "거래 수정" : "거래 추가"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as "income" | "expense");
            form.setValue("category", "");
          }}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="income" data-testid="tab-income">
              수입
            </TabsTrigger>
            <TabsTrigger value="expense" data-testid="tab-expense">
              지출
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Date Field */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>날짜</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            data-testid="input-date"
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span className="text-muted-foreground">
                                날짜 선택
                              </span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="제목을 입력하세요"
                        {...field}
                        data-testid="input-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount Field */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>금액 (원)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        data-testid="input-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Field */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>분류</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="분류 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Receipt Upload (Expense only) */}
              {activeTab === "expense" && (
                <div className="space-y-2">
                  <FormLabel>영수증</FormLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="input-receipt"
                  />
                  {getStoredReceiptPreview() ? (
                    <div className="relative">
                      <img
                        src={getStoredReceiptPreview()!}
                        alt="영수증 미리보기"
                        className="w-full max-h-48 object-cover rounded-md border"
                        data-testid="img-receipt-preview"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeReceipt}
                        data-testid="button-remove-receipt"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-upload-receipt"
                    >
                      <Camera className="w-4 h-4" />
                      영수증 촬영/첨부
                    </Button>
                  )}
                </div>
              )}

              {/* Notes Field */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>메모 (선택)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="메모를 입력하세요..."
                        className="resize-none"
                        {...field}
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full md:w-auto md:float-right"
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editTransaction ? "수정" : "추가"}
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
