import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title: string;
  date: string;
}

export function ReceiptModal({
  open,
  onOpenChange,
  imageUrl,
  title,
  date,
}: ReceiptModalProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${date}_${title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4 pr-8">
            <span className="truncate">{title}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {format(new Date(date), "yyyy-MM-dd")}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="relative w-full overflow-auto max-h-[70vh]">
          <img
            src={imageUrl}
            alt={`${title} 영수증`}
            className="w-full h-auto object-contain rounded-md"
            data-testid="img-receipt"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(imageUrl, "_blank")}
            className="gap-2"
            data-testid="button-open-receipt"
          >
            <ExternalLink className="w-4 h-4" />
            새 창에서 열기
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
            data-testid="button-download-receipt"
          >
            <Download className="w-4 h-4" />
            다운로드
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
