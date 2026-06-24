import React from "react";
import type { Program, Participant } from "../../types/program";
import { ProgramStatusBadge } from "../programs/ProgramStatusBadge";
import { calculateProgramStats } from "../../lib/calculations";
import { Eye, ClipboardCheck } from "lucide-react";

interface RecentProgramsTableProps {
  programs: Program[];
  participants: Participant[];
  onViewDetail: (id: string) => void;
  onViewReport: (id: string) => void;
}

const PROGRAM_TYPE_KO: Record<string, string> = {
  "AI Education": "AI활용교육",
  "Teaching Support": "교수지원",
  "Learning Support": "학습지원",
  "Tutoring": "튜터링",
  "Learning Community": "학습공동체",
  "Faculty Workshop": "교수법 워크숍",
  "Online Learning Support": "온라인 학습지원",
  "Other": "기타"
};

export const RecentProgramsTable: React.FC<RecentProgramsTableProps> = ({
  programs,
  participants,
  onViewDetail,
  onViewReport,
}) => {
  const recentPrograms = [...programs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
        <h2 className="text-base font-bold text-slate-100 flex items-center">
          최근 운영 프로그램
        </h2>
        <span className="text-xs text-slate-400 font-medium">최근 등록순 5개 표시</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400">프로그램 ID</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400">프로그램명</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400">유형</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400">운영 기간</th>
              <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-400">참여자</th>
              <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-400">만족도 응답률</th>
              <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-400">상태</th>
              <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-400">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-transparent">
            {recentPrograms.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                  최근에 등록된 프로그램이 없습니다.
                </td>
              </tr>
            ) : (
              recentPrograms.map((program) => {
                const programParts = participants.filter((p) => p.programId === program.id);
                const stats = calculateProgramStats(programParts);

                return (
                  <tr key={program.id} className="hover:bg-slate-800/20 transition-colors duration-150">
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-mono font-medium text-slate-400">
                      {program.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-200">
                      {program.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-medium text-slate-400">
                      {PROGRAM_TYPE_KO[program.type] || program.type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-400">
                      {program.startDate} ~ {program.endDate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-slate-300">
                      {stats.totalParticipants}명
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-xs text-slate-300">
                      {program.surveySummary ? `${program.surveySummary.responseRate}%` : "0%"}
                      {program.surveySummary && (
                        <span className="text-4xs text-slate-500 block">
                          ({program.surveySummary.respondents} / {program.surveySummary.totalParticipants}명)
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <ProgramStatusBadge status={program.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onViewDetail(program.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-slate-700 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all duration-150"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          상세보기
                        </button>
                        <button
                          onClick={() => onViewReport(program.id)}
                          className="inline-flex items-center px-2.5 py-1.5 bg-blue-600/10 border border-blue-500/30 text-xs font-semibold rounded-lg text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-150"
                        >
                          <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                          보고서 초안
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
