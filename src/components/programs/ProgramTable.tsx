import React, { useState, useMemo } from "react";
import type { Program, Participant, ProgramType, ProgramStatus } from "../../types/program";
import { ProgramStatusBadge } from "./ProgramStatusBadge";
import { calculateProgramStats } from "../../lib/calculations";
import { Search, PlusCircle, Eye, Edit2, Trash2, Filter } from "lucide-react";

interface ProgramTableProps {
  programs: Program[];
  participants: Participant[];
  onViewDetail: (id: string) => void;
  onViewEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddProgram: () => void;
}

const PROGRAM_TYPES: { value: ProgramType | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체 유형" },
  { value: "AI Education", label: "AI활용교육" },
  { value: "Teaching Support", label: "교수지원" },
  { value: "Learning Support", label: "학습지원" },
  { value: "Tutoring", label: "튜터링" },
  { value: "Learning Community", label: "학습공동체" },
  { value: "Faculty Workshop", label: "교수법 워크숍" },
  { value: "Online Learning Support", label: "온라인 학습지원" },
  { value: "Other", label: "기타" },
];

const PROGRAM_STATUSES: { value: ProgramStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체 상태" },
  { value: "Planning", label: "기획 중" },
  { value: "Recruiting", label: "모집 중" },
  { value: "Operating", label: "운영 중" },
  { value: "Completed", label: "종료" },
  { value: "Report Drafted", label: "결과보고 초안 작성" },
  { value: "Archived", label: "보관" },
];

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

export const ProgramTable: React.FC<ProgramTableProps> = ({
  programs,
  participants,
  onViewDetail,
  onViewEdit,
  onDelete,
  onAddProgram,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ProgramType | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<ProgramStatus | "ALL">("ALL");

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            program.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "ALL" || program.type === selectedType;
      const matchesStatus = selectedStatus === "ALL" || program.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [programs, searchTerm, selectedType, selectedStatus]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`'${name}' 프로그램을 정말로 삭제하시겠습니까? 연결된 참여자 데이터와 만족도 조사 결과도 삭제됩니다.`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="프로그램명 또는 ID 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all duration-200"
            />
          </div>
          
          {/* Type Filter */}
          <div className="relative min-w-[150px]">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ProgramType | "ALL")}
              className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              {PROGRAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[150px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ProgramStatus | "ALL")}
              className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              {PROGRAM_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={onAddProgram}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-600/25 transition-all duration-200 shrink-0"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          프로그램 추가
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400">프로그램 ID</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400">프로그램명</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400">유형</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400">운영 기간</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-400">참여자 수</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-400">만족도 응답률</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-400">상태</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-400">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-transparent">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                    검색 조건에 맞는 프로그램이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((program) => {
                  const programParts = participants.filter((p) => p.programId === program.id);
                  const stats = calculateProgramStats(programParts);

                  return (
                    <tr key={program.id} className="hover:bg-slate-800/10 transition-colors duration-150">
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
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onViewDetail(program.id)}
                            className="p-1.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-150"
                            title="상세 정보"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onViewEdit(program.id)}
                            className="p-1.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-150"
                            title="수정"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(program.id, program.name)}
                            className="p-1.5 border border-slate-800 hover:border-red-500/50 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition-all duration-150"
                            title="삭제"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
    </div>
  );
};
