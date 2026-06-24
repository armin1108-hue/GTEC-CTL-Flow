import React, { useState, useEffect } from "react";
import type { Program, ProgramType, ProgramStatus } from "../../types/program";
import { ArrowLeft, Save, X } from "lucide-react";

interface ProgramFormProps {
  program?: Program;
  onSave: (program: Program) => void;
  onCancel: () => void;
}

const PROGRAM_TYPES: { value: ProgramType; label: string }[] = [
  { value: "AI Education", label: "AI활용교육" },
  { value: "Teaching Support", label: "교수지원" },
  { value: "Learning Support", label: "학습지원" },
  { value: "Tutoring", label: "튜터링" },
  { value: "Learning Community", label: "학습공동체" },
  { value: "Faculty Workshop", label: "교수법 워크숍" },
  { value: "Online Learning Support", label: "온라인 학습지원" },
  { value: "Other", label: "기타" },
];

const PROGRAM_STATUSES: { value: ProgramStatus; label: string }[] = [
  { value: "Planning", label: "기획 중" },
  { value: "Recruiting", label: "모집 중" },
  { value: "Operating", label: "운영 중" },
  { value: "Completed", label: "종료" },
  { value: "Report Drafted", label: "결과보고 초안 작성" },
  { value: "Archived", label: "보관" },
];

export const ProgramForm: React.FC<ProgramFormProps> = ({
  program,
  onSave,
  onCancel,
}) => {
  const isEdit = !!program;

  const [formData, setFormData] = useState<Partial<Program>>({
    id: "",
    name: "",
    type: "AI Education",
    purpose: "",
    targetGroup: "",
    startDate: "",
    endDate: "",
    locationOrMethod: "",
    manager: "교수학습지원센터",
    maxParticipants: 30,
    description: "",
    status: "Planning",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (program) {
      setFormData(program);
    } else {
      // Autogenerate program ID for convenience
      const year = new Date().getFullYear();
      const rand = Math.floor(100 + Math.random() * 900);
      setFormData((prev) => ({
        ...prev,
        id: `CTL-${year}-${rand}`,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default 1 week
      }));
    }
  }, [program]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxParticipants" ? (value ? parseInt(value) : undefined) : value,
    }));

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.id?.trim()) newErrors.id = "프로그램 ID를 입력해주세요.";
    if (!formData.name?.trim()) newErrors.name = "프로그램명을 입력해주세요.";
    if (!formData.type) newErrors.type = "프로그램 유형을 선택해주세요.";
    if (!formData.targetGroup?.trim()) newErrors.targetGroup = "운영 대상을 입력해주세요.";
    if (!formData.startDate) newErrors.startDate = "시작일을 입력해주세요.";
    if (!formData.endDate) newErrors.endDate = "종료일을 입력해주세요.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...(formData as Program),
      surveySummary: program?.surveySummary, // Preserve survey summary if editing
      createdAt: program?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md max-w-4xl mx-auto">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-1.5 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-bold text-slate-100">
            {isEdit ? "프로그램 정보 수정" : "새 프로그램 등록"}
          </h2>
        </div>
        <span className="text-xs text-rose-500 font-semibold">* 필수 입력 항목</span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Program ID */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              프로그램 ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="id"
              value={formData.id || ""}
              onChange={handleChange}
              disabled={isEdit}
              placeholder="예: CTL-2026-001"
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all ${
                errors.id ? "border-rose-500/50" : "border-slate-800"
              } ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
            />
            {errors.id && <p className="mt-1 text-2xs text-rose-500 font-semibold">{errors.id}</p>}
          </div>

          {/* Program Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              프로그램명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="예: AI활용교육프로그램"
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all ${
                errors.name ? "border-rose-500/50" : "border-slate-800"
              }`}
            />
            {errors.name && <p className="mt-1 text-2xs text-rose-500 font-semibold">{errors.name}</p>}
          </div>

          {/* Program Type */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              프로그램 유형 <span className="text-rose-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type || "AI Education"}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {PROGRAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Group */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              운영 대상 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="targetGroup"
              value={formData.targetGroup || ""}
              onChange={handleChange}
              placeholder="예: 재학생 전체, AI교육 희망자 등"
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all ${
                errors.targetGroup ? "border-rose-500/50" : "border-slate-800"
              }`}
            />
            {errors.targetGroup && (
              <p className="mt-1 text-2xs text-rose-500 font-semibold">{errors.targetGroup}</p>
            )}
          </div>

          {/* Date Picker (Start) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              운영 시작일 <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-all ${
                errors.startDate ? "border-rose-500/50" : "border-slate-800"
              }`}
            />
            {errors.startDate && <p className="mt-1 text-2xs text-rose-500 font-semibold">{errors.startDate}</p>}
          </div>

          {/* Date Picker (End) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              운영 종료일 <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-all ${
                errors.endDate ? "border-rose-500/50" : "border-slate-800"
              }`}
            />
            {errors.endDate && <p className="mt-1 text-2xs text-rose-500 font-semibold">{errors.endDate}</p>}
          </div>

          {/* Location Or Method */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              장소 또는 운영방식
            </label>
            <input
              type="text"
              name="locationOrMethod"
              value={formData.locationOrMethod || ""}
              onChange={handleChange}
              placeholder="예: 종합관 3층 실습실, 실시간 Zoom 등"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Manager */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              담당 부서 / 담당자
            </label>
            <input
              type="text"
              name="manager"
              value={formData.manager || ""}
              onChange={handleChange}
              placeholder="예: 교수학습지원센터"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              최대 참여 인원 (명)
            </label>
            <input
              type="number"
              name="maxParticipants"
              min={1}
              value={formData.maxParticipants ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              프로그램 상태 <span className="text-rose-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status || "Planning"}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {PROGRAM_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5">
            운영 목적
          </label>
          <textarea
            name="purpose"
            rows={2}
            value={formData.purpose || ""}
            onChange={handleChange}
            placeholder="프로그램을 운영하는 주된 목적이나 달성 목표를 기재하세요."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5">
            프로그램 설명 및 비고
          </label>
          <textarea
            name="description"
            rows={3}
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="커리큘럼 요약 또는 주의사항 등을 자유롭게 작성하세요."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-slate-700 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150"
          >
            <X className="h-4 w-4 mr-2" />
            취소
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all duration-150"
          >
            <Save className="h-4 w-4 mr-2" />
            저장
          </button>
        </div>
      </form>
    </div>
  );
};
