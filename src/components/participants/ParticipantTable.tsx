import React, { useState, useMemo } from "react";
import type { Participant, ApplicationStatus, AttendanceStatus, CompletionStatus } from "../../types/program";
import { calculateProgramStats } from "../../lib/calculations";
import { 
  UserCheck, 
  Trash2, 
  Plus, 
  ShieldAlert, 
  CheckSquare, 
  MinusSquare,
  Users, 
  CalendarRange, 
  GraduationCap 
} from "lucide-react";

interface ParticipantTableProps {
  programId: string;
  participants: Participant[];
  onSaveParticipant: (participant: Participant) => void;
  onSaveParticipantsBulk: (participants: Participant[]) => void;
  onDeleteParticipant: (id: string) => void;
}

const GRADES = ["1학년", "2학년", "3학년", "4학년"];
const MAJORS = ["공학계열", "자연과학계열", "인문사회계열", "예체능계열"];

const APPLICATION_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "Applied", label: "신청" },
  { value: "Selected", label: "선정" },
  { value: "Waiting", label: "대기" },
  { value: "Cancelled", label: "취소" },
];

const ATTENDANCE_STATUSES: { value: AttendanceStatus; label: string }[] = [
  { value: "Attended", label: "참석" },
  { value: "Absent", label: "불참" },
  { value: "Not Checked", label: "미확인" },
];

const COMPLETION_STATUSES: { value: CompletionStatus; label: string }[] = [
  { value: "Completed", label: "수료" },
  { value: "Not Completed", label: "미수료" },
  { value: "Pending", label: "대기" },
];

export const ParticipantTable: React.FC<ParticipantTableProps> = ({
  programId,
  participants,
  onSaveParticipant,
  onSaveParticipantsBulk,
  onDeleteParticipant,
}) => {
  // States for adding a new participant
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newGrade, setNewGrade] = useState("1학년");
  const [newMajor, setNewMajor] = useState("공학계열");
  const [addError, setAddError] = useState("");

  // States for selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Stats calculation
  const stats = useMemo(() => calculateProgramStats(participants), [participants]);

  // Next participant code helper
  const suggestNextCode = () => {
    const codes = participants
      .map(p => {
        const match = p.participantCode.match(/^P(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);
    const maxNum = codes.length > 0 ? Math.max(...codes) : 0;
    return `P${String(maxNum + 1).padStart(3, "0")}`;
  };

  const handleOpenAddForm = () => {
    setNewCode(suggestNextCode());
    setShowAddForm(true);
    setAddError("");
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      setAddError("참여자 코드를 입력하세요.");
      return;
    }
    
    // Check for duplicate code
    const isDuplicate = participants.some(
      p => p.participantCode.toUpperCase() === newCode.trim().toUpperCase()
    );
    if (isDuplicate) {
      setAddError("이미 존재하는 참여자 코드입니다.");
      return;
    }

    const newParticipant: Participant = {
      id: `part-${newCode.trim().toUpperCase()}-${Date.now()}`,
      programId,
      participantCode: newCode.trim().toUpperCase(),
      grade: newGrade,
      majorGroup: newMajor,
      applicationStatus: "Selected",
      attendanceStatus: "Not Checked",
      completionStatus: "Pending",
      surveySubmitted: false,
    };

    onSaveParticipant(newParticipant);
    setShowAddForm(false);
    setNewCode("");
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredParticipants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredParticipants.map(p => p.id));
    }
  };

  // Bulk status updates
  const handleBulkAttendance = (status: AttendanceStatus) => {
    const updated = participants.map(p => {
      if (selectedIds.includes(p.id)) {
        // Also implicitly match completion if marked attended/absent for convenience
        let compStatus = p.completionStatus;
        if (status === "Attended") compStatus = "Completed";
        else if (status === "Absent") compStatus = "Not Completed";
        
        return { 
          ...p, 
          attendanceStatus: status,
          completionStatus: compStatus
        };
      }
      return p;
    });
    onSaveParticipantsBulk(updated.filter(p => selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const handleBulkCompletion = (status: CompletionStatus) => {
    const updated = participants.map(p => {
      if (selectedIds.includes(p.id)) {
        return { ...p, completionStatus: status };
      }
      return p;
    });
    onSaveParticipantsBulk(updated.filter(p => selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  // Single cell inline edits
  const handleCellChange = <K extends keyof Participant>(id: string, field: K, value: Participant[K]) => {
    const participant = participants.find(p => p.id === id);
    if (!participant) return;

    // Automatic rules: if attendance is marked Attended, set Completion to Completed by default
    let updated = { ...participant, [field]: value };
    if (field === "attendanceStatus") {
      if (value === "Attended") {
        updated.completionStatus = "Completed";
      } else if (value === "Absent") {
        updated.completionStatus = "Not Completed";
      }
    }

    onSaveParticipant(updated);
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`참여자 '${code}'를(을) 명단에서 삭제하시겠습니까?`)) {
      onDeleteParticipant(id);
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => 
      p.participantCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.majorGroup.includes(searchTerm) ||
      p.grade.includes(searchTerm)
    );
  }, [participants, searchTerm]);

  return (
    <div className="space-y-5">
      {/* PII Alert Warning Banner */}
      <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start text-xs text-rose-300">
        <ShieldAlert className="h-5 w-5 mr-3 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">개인정보 수집 및 저장 금지 안내</p>
          <p className="leading-relaxed opacity-90">
            본 시스템은 비식별 학적 데이터를 기반으로 동작합니다. <strong>학생 이름, 실제 학번, 연락처, 이메일, 성적 등</strong> 개인을 특정할 수 있는 민감한 실명 데이터는 <strong>절대 입력하지 마십시오</strong>. 비식별 참여 코드로만 관리합니다.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xs font-semibold text-slate-400">전체 명단 인원</p>
            <p className="text-lg font-bold text-slate-100">{stats.totalParticipants}명</p>
          </div>
        </div>
        
        {/* Attendance */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-2xs font-semibold text-slate-400">참석자 (출석률)</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold text-slate-100">{stats.attendedCount}명</span>
              <span className="text-xs font-semibold text-indigo-400">({stats.attendanceRate}%)</span>
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-2xs font-semibold text-slate-400">수료자 (수료율)</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold text-slate-100">{stats.completedCount}명</span>
              <span className="text-xs font-semibold text-emerald-400">({stats.completionRate}%)</span>
            </div>
          </div>
        </div>

        {/* Survey Response */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-2xs font-semibold text-slate-400">만족도 설문 응답</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold text-slate-100">{stats.respondentsCount}명</span>
              <span className="text-xs font-semibold text-orange-400">({stats.responseRate}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Table Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="참여자 코드, 학년, 전공 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bulk Update Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg shrink-0">
              <span className="text-xs text-slate-400 mr-2 font-medium">
                {selectedIds.length}명 선택됨:
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleBulkAttendance("Attended")}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-3xs font-semibold transition"
                >
                  참석 처리
                </button>
                <button
                  onClick={() => handleBulkAttendance("Absent")}
                  className="px-2 py-1 bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 rounded text-3xs font-semibold transition"
                >
                  불참 처리
                </button>
                <button
                  onClick={() => handleBulkCompletion("Completed")}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-3xs font-semibold transition"
                >
                  수료 처리
                </button>
                <button
                  onClick={() => handleBulkCompletion("Not Completed")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-3xs font-semibold transition"
                >
                  미수료 처리
                </button>
              </div>
            </div>
          )}

          {/* Add Participant Trigger Button */}
          {!showAddForm && (
            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center justify-center px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/25 transition-all duration-200"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              참여자 개별 추가
            </button>
          )}
        </div>
      </div>

      {/* Add Form (Inline Card) */}
      {showAddForm && (
        <form onSubmit={handleAddParticipant} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl max-w-2xl mx-auto space-y-4">
          <h3 className="text-xs font-bold text-slate-200">새 비식별 참여자 추가</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-4xs font-bold text-slate-400 mb-1">참여자 코드</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="예: P031"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-4xs font-bold text-slate-400 mb-1">학년</label>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                {GRADES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-4xs font-bold text-slate-400 mb-1">전공계열</label>
              <select
                value={newMajor}
                onChange={(e) => setNewMajor(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                {MAJORS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          {addError && <p className="text-4xs font-semibold text-rose-500">{addError}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 border border-slate-700 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              추가 완료
            </button>
          </div>
        </form>
      )}

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-200 inline-flex items-center"
                    type="button"
                  >
                    {selectedIds.length === filteredParticipants.length && filteredParticipants.length > 0 ? (
                      <CheckSquare className="h-4.5 w-4.5 text-blue-500" />
                    ) : (
                      <MinusSquare className="h-4.5 w-4.5 text-slate-600" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">참여자 ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">학년</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">전공계열</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">신청 상태</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">출석 상태</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">수료 상태</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">설문 응답</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">만족도/추천</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-transparent">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-500">
                    등록된 참여자가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => (
                  <tr 
                    key={p.id} 
                    className={`hover:bg-slate-800/10 transition-colors duration-150 ${
                      selectedIds.includes(p.id) ? "bg-blue-600/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => handleToggleSelect(p.id)}
                        className="h-3.5 w-3.5 rounded border-slate-800 text-blue-600 focus:ring-blue-500 bg-slate-950 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-bold text-slate-300">
                      {p.participantCode}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {p.grade}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {p.majorGroup}
                    </td>
                    
                    {/* Application Status Select */}
                    <td className="px-4 py-3 text-center">
                      <select
                        value={p.applicationStatus}
                        onChange={(e) => handleCellChange(p.id, "applicationStatus", e.target.value as ApplicationStatus)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {APPLICATION_STATUSES.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Attendance Status Select */}
                    <td className="px-4 py-3 text-center">
                      <select
                        value={p.attendanceStatus}
                        onChange={(e) => handleCellChange(p.id, "attendanceStatus", e.target.value as AttendanceStatus)}
                        className={`bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer ${
                          p.attendanceStatus === "Attended" ? "text-indigo-400" : p.attendanceStatus === "Absent" ? "text-rose-400" : "text-slate-400"
                        }`}
                      >
                        {ATTENDANCE_STATUSES.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Completion Status Select */}
                    <td className="px-4 py-3 text-center">
                      <select
                        value={p.completionStatus}
                        onChange={(e) => handleCellChange(p.id, "completionStatus", e.target.value as CompletionStatus)}
                        className={`bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer ${
                          p.completionStatus === "Completed" ? "text-emerald-400" : p.completionStatus === "Not Completed" ? "text-slate-500" : "text-amber-400"
                        }`}
                      >
                        {COMPLETION_STATUSES.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Survey Submitted Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleCellChange(p.id, "surveySubmitted", !p.surveySubmitted)}
                        className={`px-2 py-0.5 rounded text-3xs font-bold ${
                          p.surveySubmitted 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {p.surveySubmitted ? "제출" : "미제출"}
                      </button>
                    </td>

                    {/* satisfaction rating score view */}
                    <td className="px-4 py-3 text-center text-xs text-slate-400 font-mono">
                      {p.surveySubmitted ? (
                        <div className="flex items-center justify-center space-x-1.5">
                          <span className="text-slate-200 font-semibold">{p.overallSatisfaction ?? "-"}</span>
                          <span className="text-slate-600">/</span>
                          <span className="text-slate-300">{p.recommendScore ?? "-"}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* delete button */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(p.id, p.participantCode)}
                        className="p-1 text-slate-500 hover:text-red-400 transition"
                        title="참여자 삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
