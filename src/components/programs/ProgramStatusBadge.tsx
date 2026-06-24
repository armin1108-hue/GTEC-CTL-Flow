import React from "react";
import type { ProgramStatus } from "../../types/program";

interface ProgramStatusBadgeProps {
  status: ProgramStatus;
}

const STATUS_MAP: Record<ProgramStatus, { text: string; classes: string }> = {
  Planning: {
    text: "기획 중",
    classes: "bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20",
  },
  Recruiting: {
    text: "모집 중",
    classes: "bg-sky-500/10 text-sky-400 ring-1 ring-inset ring-sky-500/20",
  },
  Operating: {
    text: "운영 중",
    classes: "bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20",
  },
  Completed: {
    text: "종료",
    classes: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
  },
  "Report Drafted": {
    text: "결과보고 초안 작성",
    classes: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
  },
  Archived: {
    text: "보관",
    classes: "bg-slate-700/15 text-slate-500 ring-1 ring-inset ring-slate-700/30",
  },
};

export const ProgramStatusBadge: React.FC<ProgramStatusBadgeProps> = ({ status }) => {
  const config = STATUS_MAP[status] || {
    text: status,
    classes: "bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${config.classes}`}>
      {config.text}
    </span>
  );
};
