import { useState, useEffect, useMemo } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { SummaryCard } from "./components/dashboard/SummaryCard";
import { RecentProgramsTable } from "./components/dashboard/RecentProgramsTable";
import { ProgramTable } from "./components/programs/ProgramTable";
import { ProgramForm } from "./components/programs/ProgramForm";
import { ProgramDetail } from "./components/programs/ProgramDetail";
import type { Program, Participant } from "./types/program";
import { 
  getPrograms, 
  getParticipants, 
  saveProgram, 
  deleteProgram, 
  resetStorageToDefault, 
  initializeStorage 
} from "./lib/storage";
import { calculateDashboardStats } from "./lib/calculations";
import { PlusCircle, ClipboardCheck, LayoutGrid, CalendarRange } from "lucide-react";

type ViewState = "dashboard" | "programs" | "new-program" | "edit-program" | "program-detail";

function App() {
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  
  // App data states
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);

  // Initialize storage and load data
  const loadData = async () => {
    try {
      initializeStorage();
      const progs = await getPrograms();
      const parts = await getParticipants();
      setPrograms(progs);
      setAllParticipants(parts);
    } catch (err) {
      console.error("Failed to load application data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dashboardStats = useMemo(() => {
    return calculateDashboardStats(programs, allParticipants);
  }, [programs, allParticipants]);

  const handleResetData = async () => {
    try {
      await resetStorageToDefault();
      await loadData();
      setCurrentView("dashboard");
      setSelectedProgramId(null);
    } catch (err) {
      alert("데이터 초기화에 실패했습니다.");
    }
  };

  const handleSaveProgram = async (updatedProg: Program) => {
    try {
      await saveProgram(updatedProg);
      await loadData();
      // Navigate back to the program detail or program list
      setSelectedProgramId(updatedProg.id);
      setCurrentView("program-detail");
    } catch (err) {
      alert(err instanceof Error ? err.message : "프로그램 저장에 실패했습니다.");
    }
  };

  const handleDeleteProgram = async (id: string) => {
    try {
      await deleteProgram(id);
      await loadData();
      setSelectedProgramId(null);
      setCurrentView("programs");
    } catch (err) {
      alert(err instanceof Error ? err.message : "프로그램 삭제에 실패했습니다.");
    }
  };

  const handleNavigateDetail = (id: string) => {
    setSelectedProgramId(id);
    setCurrentView("program-detail");
  };

  const handleNavigateEdit = (id: string) => {
    setSelectedProgramId(id);
    setCurrentView("edit-program");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Upper Navigation Header */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar 
          currentView={currentView} 
          onViewChange={(view) => {
            setCurrentView(view as ViewState);
            setSelectedProgramId(null);
          }}
          onResetData={handleResetData}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* View 1: Dashboard */}
            {currentView === "dashboard" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center">
                      <LayoutGrid className="h-5 w-5 mr-2 text-blue-500" />
                      센터 대시보드
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">GTEC CTL 프로그램 운영 현황 및 종합 성과 지표</p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex space-x-2.5">
                    <button
                      onClick={() => setCurrentView("new-program")}
                      className="inline-flex items-center px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/25 transition-all duration-150"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      프로그램 등록
                    </button>
                    
                    {programs.some(p => p.id === "AI-2026-001") && (
                      <button
                        onClick={() => {
                          setSelectedProgramId("AI-2026-001");
                          setCurrentView("program-detail");
                          // Let the detailed view render, it defaults to overview but users can click on tabs.
                        }}
                        className="inline-flex items-center px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                      >
                        <ClipboardCheck className="h-4 w-4 mr-2 text-indigo-400" />
                        AI 교육보고서 초안
                      </button>
                    )}
                  </div>
                </div>

                {/* Dashboard Cards Grid */}
                <SummaryCard stats={dashboardStats} />

                {/* Recent Programs Table */}
                <RecentProgramsTable 
                  programs={programs} 
                  participants={allParticipants}
                  onViewDetail={handleNavigateDetail}
                  onViewReport={(id) => {
                    setSelectedProgramId(id);
                    setCurrentView("program-detail");
                  }}
                />
              </div>
            )}

            {/* View 2: Program List */}
            {currentView === "programs" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center">
                    <CalendarRange className="h-5 w-5 mr-2 text-blue-500" />
                    프로그램 목록 관리
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">경기과기대 교수학습지원센터 운영 프로그램 전체 목록</p>
                </div>

                <ProgramTable 
                  programs={programs} 
                  participants={allParticipants}
                  onViewDetail={handleNavigateDetail}
                  onViewEdit={handleNavigateEdit}
                  onDelete={handleDeleteProgram}
                  onAddProgram={() => setCurrentView("new-program")}
                />
              </div>
            )}

            {/* View 3: New Program Form */}
            {currentView === "new-program" && (
              <ProgramForm 
                onSave={handleSaveProgram} 
                onCancel={() => {
                  setCurrentView("programs");
                  setSelectedProgramId(null);
                }} 
              />
            )}

            {/* View 4: Edit Program Form */}
            {currentView === "edit-program" && selectedProgramId && (
              <ProgramForm 
                program={programs.find(p => p.id === selectedProgramId)}
                onSave={handleSaveProgram}
                onCancel={() => {
                  setCurrentView("program-detail");
                }}
              />
            )}

            {/* View 5: Program Detail */}
            {currentView === "program-detail" && selectedProgramId && (
              <ProgramDetail 
                programId={selectedProgramId}
                onBack={() => {
                  setCurrentView("programs");
                  setSelectedProgramId(null);
                }}
                onEdit={handleNavigateEdit}
                onDelete={handleDeleteProgram}
              />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
