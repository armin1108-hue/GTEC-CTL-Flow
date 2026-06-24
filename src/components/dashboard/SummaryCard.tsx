import React from "react";
import { 
  FileText, 
  Activity, 
  CheckCircle2, 
  Users, 
  Award, 
  ClipboardList, 
  Star 
} from "lucide-react";
import type { DashboardOverviewStats } from "../../lib/calculations";

interface SummaryCardsProps {
  stats: DashboardOverviewStats;
}

export const SummaryCard: React.FC<SummaryCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: "전체 프로그램 수",
      value: `${stats.totalProgramsCount}개`,
      icon: FileText,
      color: "from-blue-600/10 to-indigo-600/5 text-blue-500 border-blue-500/20",
    },
    {
      title: "운영 중 프로그램 수",
      value: `${stats.operatingProgramsCount}개`,
      icon: Activity,
      color: "from-sky-600/10 to-cyan-600/5 text-sky-500 border-sky-500/20",
    },
    {
      title: "종료된 프로그램 수",
      value: `${stats.completedProgramsCount}개`,
      icon: CheckCircle2,
      color: "from-emerald-600/10 to-green-600/5 text-emerald-500 border-emerald-500/20",
    },
    {
      title: "전체 참여자 수",
      value: `${stats.totalParticipantsCount}명`,
      icon: Users,
      color: "from-purple-600/10 to-pink-600/5 text-purple-500 border-purple-500/20",
    },
    {
      title: "수료자 수 (수료율)",
      value: `${stats.totalCompletedCount}명`,
      subtitle: stats.totalParticipantsCount > 0 
        ? `수료율: ${Math.round((stats.totalCompletedCount / stats.totalParticipantsCount) * 1000) / 10}%`
        : "수료율: 0%",
      icon: Award,
      color: "from-teal-600/10 to-emerald-600/5 text-teal-500 border-teal-500/20",
    },
    {
      title: "만족도 조사 응답률",
      value: `${stats.overallResponseRate}%`,
      icon: ClipboardList,
      color: "from-orange-600/10 to-amber-600/5 text-orange-500 border-orange-500/20",
    },
    {
      title: "평균 만족도 점수",
      value: stats.overallAverageSatisfaction > 0 ? `${stats.overallAverageSatisfaction} / 5.0` : "N/A",
      icon: Star,
      color: "from-amber-600/10 to-yellow-600/5 text-amber-500 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        // Make the last card take full width on smaller screens or fit grid
        const isLast = idx === cards.length - 1;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-xl border bg-slate-900/40 p-5 shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md ${card.color} ${
              isLast ? "sm:col-span-2 lg:col-span-1" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{card.title}</span>
              <div className="rounded-lg p-2 bg-slate-900 border border-slate-800">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight text-slate-100">{card.value}</span>
              {card.subtitle && (
                <p className="mt-1 text-xs text-slate-400 font-medium">{card.subtitle}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
