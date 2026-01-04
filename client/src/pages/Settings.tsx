import { useRef } from "react";
import { Download, Upload, FileJson, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

export default function Settings() {
  const { exportAllData, importAllData, exportCSV } = useData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `회계데이터_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "내보내기 완료",
      description: "JSON 파일이 다운로드되었습니다",
    });
  };

  const handleExportCSV = () => {
    const data = exportCSV();
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + data], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `거래내역_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "내보내기 완료",
      description: "CSV 파일이 다운로드되었습니다",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importAllData(content);

      if (success) {
        toast({
          title: "가져오기 완료",
          description: "데이터를 성공적으로 불러왔습니다",
        });
      } else {
        toast({
          title: "가져오기 실패",
          description: "파일 형식이 올바르지 않습니다",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-settings-title">
          설정
        </h1>
        <p className="text-muted-foreground">
          데이터 백업 및 복원
        </p>
      </div>

      {/* Data Storage Info */}
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>데이터 저장 안내</AlertTitle>
        <AlertDescription>
          모든 데이터는 이 브라우저의 로컬 저장소에 저장됩니다.
          다른 기기에서 사용하거나 브라우저 데이터 삭제에 대비하여 정기적으로 백업하세요.
        </AlertDescription>
      </Alert>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle>데이터 내보내기</CardTitle>
          <CardDescription>
            현재 저장된 모든 데이터를 파일로 다운로드합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleExportJSON}
              data-testid="button-export-json"
            >
              <FileJson className="w-4 h-4" />
              JSON으로 내보내기
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleExportCSV}
              data-testid="button-export-csv"
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV로 내보내기
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            JSON: 모든 설정과 거래 내역 포함 (복원용)
            <br />
            CSV: 거래 내역만 포함 (엑셀에서 열기 가능)
          </p>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle>데이터 가져오기</CardTitle>
          <CardDescription>
            백업한 JSON 파일에서 데이터를 복원합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            data-testid="input-import"
          />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-import"
          >
            <Upload className="w-4 h-4" />
            JSON 파일 선택
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>주의</AlertTitle>
            <AlertDescription>
              데이터를 가져오면 현재 저장된 데이터가 덮어씌워집니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Separator />

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>사용 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">1. 예산 설정</h4>
            <p className="text-muted-foreground">
              먼저 "예산" 메뉴에서 지출 분류와 연간 예산을 설정하세요.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. 거래 입력</h4>
            <p className="text-muted-foreground">
              "입력" 메뉴에서 수입과 지출을 기록하세요. 지출의 경우 영수증 사진도 첨부할 수 있습니다.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">3. 보고서 확인</h4>
            <p className="text-muted-foreground">
              "보고서" 메뉴에서 월별 결산을 확인하고 인쇄할 수 있습니다.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">4. 정기 백업</h4>
            <p className="text-muted-foreground">
              중요한 데이터이므로 정기적으로 JSON 파일로 백업하시기 바랍니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
