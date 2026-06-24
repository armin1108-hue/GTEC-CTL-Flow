import React, { useState, useEffect, useMemo } from "react";
import type { Program, Participant, SurveySummary, ProgramStatus } from "../../types/program";
import { 
  getProgramById, 
  saveProgram, 
  getParticipants, 
  saveParticipant, 
  saveParticipantsBulk, 
  deleteParticipant,
  saveSurveySummary
} from "../../lib/storage";
import { calculateProgramStats } from "../../lib/calculations";
import { ProgramStatusBadge } from "./ProgramStatusBadge";
import { ParticipantTable } from "../participants/ParticipantTable";
import { SurveySummaryForm } from "../survey/SurveySummaryForm";
import { ReportGenerator } from "../report/ReportGenerator";
import { 
  Calendar, 
  MapPin, 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare,
  ChevronRight,
  Trash2,
  Edit
} from "lucide-react";

interface ProgramDetailProps {
  programId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
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

export const ProgramDetail: React.FC<ProgramDetailProps> = ({
  programId,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [program, setProgram] = useState<Program | undefined>(undefined);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "participants" | "survey" | "report">("overview");

  // Load data from storage
  const loadData = async () => {
    try {
      const prog = await getProgramById(programId);
      if (prog) {
        setProgram(prog);
        const parts = await getParticipants(programId);
        setParticipants(parts);
      }
    } catch (err) {
      console.error("Failed to load program details:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [programId]);

  const stats = useMemo(() => calculateProgramStats(participants), [participants]);

  if (!program) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
        <p className="text-slate-400 text-sm mb-4">해당 프로그램을 찾을 수 없습니다.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // Handle participant save
  const handleSaveParticipant = async (p: Participant) => {
    try {
      await saveParticipant(p);
      await loadData(); // Reload to sync stats
    } catch (err) {
      alert(err instanceof Error ? err.message : "참여자 저장에 실패했습니다.");
    }
  };

  // Handle bulk participant save
  const handleSaveParticipantsBulk = async (list: Participant[]) => {
    try {
      await saveParticipantsBulk(list);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "참여자 일괄 저장에 실패했습니다.");
    }
  };

  // Handle participant delete
  const handleDeleteParticipant = async (id: string) => {
    try {
      await deleteParticipant(id, programId);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "참여자 삭제에 실패했습니다.");
    }
  };

  // Handle survey save
  const handleSaveSurvey = async (s: SurveySummary) => {
    try {
      await saveSurveySummary(programId, s);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "만족도 조사 저장에 실패했습니다.");
    }
  };

  // Automatically update status to Report Drafted when copy/download is triggered
  const handleStatusChangeToReportDrafted = async () => {
    if (program.status !== "Report Drafted" && program.status !== "Archived") {
      try {
        const updated = { ...program, status: "Report Drafted" as ProgramStatus };
        await saveProgram(updated);
        await loadData();
      } catch (err) {
        console.error("Failed to update status to Report Drafted:", err);
      }
    }
  };

  const handleDeleteProgram = () => {
    if (window.confirm(`'${program.name}' 프로그램을 정말 삭제하시겠습니까? 관련 데이터가 모두 지워집니다.`)) {
      onDelete(programId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Detail Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <button onClick={onBack} className="hover:text-blue-400 transition">프로그램 목록</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-300 font-semibold truncate max-w-[200px]">{program.name}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(program.id)}
            className="inline-flex items-center px-3 py-1.5 border border-slate-700 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-300 hover:text-white transition"
          >
            <Edit className="h-3.5 w-3.5 mr-1 text-slate-400" />
            정보 수정
          </button>
          <button
            onClick={handleDeleteProgram}
            className="inline-flex items-center px-3 py-1.5 border border-slate-800 hover:border-red-500/50 hover:bg-red-950/20 text-xs font-semibold rounded-lg text-slate-400 hover:text-red-400 transition"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1 text-slate-500 hover:text-red-400" />
            프로그램 삭제
          </button>
        </div>
      </div>

      {/* Program Summary Card Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-xl font-bold text-slate-100">{program.name}</h2>
            <ProgramStatusBadge status={program.status} />
          </div>
          <p className="text-slate-400 text-xs font-medium">
            유형: <span className="text-slate-200">{PROGRAM_TYPE_KO[program.type] || program.type}</span>
            <span className="mx-2 text-slate-600">|</span>
            담당자: <span className="text-slate-200">{program.manager}</span>
            <span className="mx-2 text-slate-600">|</span>
            ID: <span className="text-slate-400 font-mono">{program.id}</span>
          </p>
        </div>
        
        {/* Core Stats Overview */}
        <div className="flex space-x-6 text-slate-400 text-xs font-semibold bg-slate-950/40 p-4 border border-slate-800 rounded-lg">
          <div className="text-center">
            <span className="block text-slate-500 text-3xs font-bold uppercase mb-1">참여자</span>
            <span className="text-base font-extrabold text-slate-200">{stats.totalParticipants}명</span>
          </div>
          <div className="border-l border-slate-850 h-8 self-center" />
          <div className="text-center">
            <span className="block text-slate-500 text-3xs font-bold uppercase mb-1">출석률</span>
            <span className="text-base font-extrabold text-indigo-400">{stats.attendanceRate}%</span>
          </div>
          <div className="border-l border-slate-850 h-8 self-center" />
          <div className="text-center">
            <span className="block text-slate-500 text-3xs font-bold uppercase mb-1">수료율</span>
            <span className="text-base font-extrabold text-emerald-400">{stats.completionRate}%</span>
          </div>
          {program.surveySummary && (
            <>
              <div className="border-l border-slate-850 h-8 self-center" />
              <div className="text-center">
                <span className="block text-slate-500 text-3xs font-bold uppercase mb-1">설문만족</span>
                <span className="text-base font-extrabold text-amber-400">{program.surveySummary.averageOverallSatisfaction.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-800">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: "overview", name: "개요", icon: BookOpen },
            { id: "participants", name: "참여자 관리", icon: Users },
            { id: "survey", name: "만족도 조사", icon: MessageSquare },
            { id: "report", name: "결과보고서 초안", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab Panels */}
      <div className="py-2">
        {activeTab === "overview" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Basic Metadata */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200 pb-2 border-b border-slate-800 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                  기본 일정 및 정보
                </h3>
                
                <table className="min-w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-850">
                      <td className="py-3 font-semibold text-slate-400 w-32">운영 기간</td>
                      <td className="py-3 text-slate-200">{program.startDate} ~ {program.endDate}</td>
                    </tr>
                    <tr className="border-b border-slate-850">
                      <td className="py-3 font-semibold text-slate-400">장소 / 운영방식</td>
                      <td className="py-3 text-slate-200">{program.locationOrMethod || "미정"}</td>
                    </tr>
                    <tr className="border-b border-slate-850">
                      <td className="py-3 font-semibold text-slate-400">운영 대상</td>
                      <td className="py-3 text-slate-200">{program.targetGroup}</td>
                    </tr>
                    <tr className="border-b border-slate-850">
                      <td className="py-3 font-semibold text-slate-400">최대 정원</td>
                      <td className="py-3 text-slate-200">{program.maxParticipants ? `${program.maxParticipants}명` : "제한 없음"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">담당 부서</td>
                      <td className="py-3 text-slate-200">{program.manager}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right Column: Purpose and Descriptions */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200 pb-2 border-b border-slate-800 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                  운영 상세 목적 및 기획안
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-1">운영 목적</h4>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs text-slate-300 leading-relaxed">
                      {program.purpose || "등록된 운영 목적 정보가 없습니다."}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-1">상세 설명 / 비고</h4>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {program.description || "등록된 설명 및 비고 내용이 없습니다."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex justify-end pt-5 border-t border-slate-800 space-x-3 text-xs">
              <button
                onClick={() => setActiveTab("participants")}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-lg font-semibold"
              >
                참여자 상태 확인하기
              </button>
              <button
                onClick={() => setActiveTab("report")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
              >
                결과보고서 생성
              </button>
            </div>
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === "participants" && (
          <ParticipantTable
            programId={program.id}
            participants={participants}
            onSaveParticipant={handleSaveParticipant}
            onSaveParticipantsBulk={handleSaveParticipantsBulk}
            onDeleteParticipant={handleDeleteParticipant}
          />
        )}

        {/* Survey Tab */}
        {activeTab === "survey" && (
          <SurveySummaryForm
            program={program}
            totalParticipants={participants.length}
            onSaveSurvey={handleSaveSurvey}
          />
        )}

        {/* Report Tab */}
        {activeTab === "report" && (
          <ReportGenerator
            program={program}
            participants={participants}
            onStatusChangeToReportDrafted={handleStatusChangeToReportDrafted}
          />
        )}
      </div>
    </div>
  );
};
