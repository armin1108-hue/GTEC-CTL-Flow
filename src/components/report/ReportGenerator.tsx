import { useState, useEffect } from "react";
import type { Program, Participant } from "../../types/program";
import { generateReportText } from "../../lib/reportGenerator";
import { Copy, Check, Download, FileText, RefreshCw, AlertCircle } from "lucide-react";

interface ReportGeneratorProps {
  program: Program;
  participants: Participant[];
  onStatusChangeToReportDrafted: () => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  program,
  participants,
  onStatusChangeToReportDrafted,
}) => {
  const [reportText, setReportText] = useState("");
  const [copied, setCopied] = useState(false);

  // Automatically generate report when program or participants list change
  useEffect(() => {
    const text = generateReportText(program, participants);
    setReportText(text);
  }, [program, participants]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onStatusChangeToReportDrafted(); // Automatically update program status to "Report Drafted" as a convenience!
    } catch (err) {
      alert("클립보드 복사에 실패했습니다. 아래 텍스트를 직접 드래그하여 복사해 주세요.");
    }
  };

  const handleDownload = (format: "txt" | "md") => {
    const element = document.createElement("a");
    const file = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    
    // Replace special chars for safety in filename
    const safeName = program.name.replace(/[^a-zA-Z0-9가-힣]/g, "_");
    element.download = `${program.id}_${safeName}_결과보고서_초안.${format}`;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    onStatusChangeToReportDrafted();
  };

  return (
    <div className="space-y-5">
      {/* Notice Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start text-xs text-blue-300">
        <AlertCircle className="h-5 w-5 mr-3 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">행정 승인 검토 요청 안내문</p>
          <p className="leading-relaxed opacity-95">
            본 결과보고서 초안은 입력된 프로그램 운영 조건과 참여율, 출석 정보, 만족도 설문 요약 데이터를 기반으로 <strong>자동 생성</strong>되었습니다. 행정 절차 및 정식 결재 전, 반드시 담당 교수/담당자 분께서 내용을 읽고 수정 및 검토해 주시기 바랍니다.
          </p>
        </div>
      </div>

      {/* Report Editor & Control bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">결과보고서 초안 텍스트 미리보기</span>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 animate-bounce" />
                  복사 완료
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  텍스트 복사
                </>
              )}
            </button>

            {/* Markdown download */}
            <button
              onClick={() => handleDownload("md")}
              className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
              MD 다운로드
            </button>

            {/* TXT download */}
            <button
              onClick={() => handleDownload("txt")}
              className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
              TXT 다운로드
            </button>

            {/* Regenerate manually */}
            <button
              onClick={() => {
                setReportText(generateReportText(program, participants));
                alert("결과보고서 초안이 최신 정보로 갱신되었습니다.");
              }}
              className="p-1.5 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
              title="보고서 갱신"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Text Preview Box */}
        <div className="p-6 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[500px]">
          <pre className="whitespace-pre-wrap font-sans text-sm select-all">{reportText}</pre>
        </div>
      </div>
    </div>
  );
};
