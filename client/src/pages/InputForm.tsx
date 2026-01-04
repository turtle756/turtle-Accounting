import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/TransactionForm";

export default function InputFormPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-4 pb-24 md:pb-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold" data-testid="text-input-title">
          거래 추가
        </h1>
      </div>

      <TransactionForm />
    </div>
  );
}
