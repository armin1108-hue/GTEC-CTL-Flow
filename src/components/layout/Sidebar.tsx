import React from "react";
import { LayoutDashboard, ListTodo, PlusCircle, RotateCcw, HelpCircle } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onResetData,
}) => {
  const menuItems = [
    { id: "dashboard", name: "대시보드", icon: LayoutDashboard },
    { id: "programs", name: "프로그램 목록", icon: ListTodo },
    { id: "new-program", name: "프로그램 등록", icon: PlusCircle },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 py-6 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === "programs" && currentView.startsWith("program-detail"));
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className={`h-4 w-4 mr-3 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
              {item.name}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center text-slate-300 text-xs font-semibold mb-1">
            <HelpCircle className="h-3 w-3 mr-1 text-blue-400" />
            MVP 가이드
          </div>
          <p className="text-slate-400 text-3xs leading-relaxed">
            AI 교육프로그램의 30명 가상 데이터를 확인하고 출석 수정, 만족도 요약 입력 및 결과보고서 생성을 진행해 보세요.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm("모든 데이터를 초기 가상 데이터 상태로 복구하시겠습니까? 수정한 정보가 손실됩니다.")) {
              onResetData();
            }
          }}
          className="flex items-center justify-center w-full px-3 py-2 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs font-medium transition-all duration-200"
        >
          <RotateCcw className="h-3 w-3 mr-2 text-slate-400" />
          샘플 데이터 초기화
        </button>
      </div>
    </aside>
  );
};
