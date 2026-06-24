import type { Participant, Program } from "../types/program";

export interface ProgramStats {
  totalParticipants: number;
  attendedCount: number;
  absentCount: number;
  notCheckedCount: number;
  completedCount: number;
  notCompletedCount: number;
  pendingCount: number;
  attendanceRate: number; // percentage
  completionRate: number; // percentage
  respondentsCount: number;
  responseRate: number; // percentage
}

export const calculateProgramStats = (participants: Participant[]): ProgramStats => {
  const totalParticipants = participants.length;

  const attendedCount = participants.filter((p) => p.attendanceStatus === "Attended").length;
  const absentCount = participants.filter((p) => p.attendanceStatus === "Absent").length;
  const notCheckedCount = participants.filter((p) => p.attendanceStatus === "Not Checked").length;

  const completedCount = participants.filter((p) => p.completionStatus === "Completed").length;
  const notCompletedCount = participants.filter((p) => p.completionStatus === "Not Completed").length;
  const pendingCount = participants.filter((p) => p.completionStatus === "Pending").length;

  const respondentsCount = participants.filter((p) => p.surveySubmitted).length;

  const attendanceRate = totalParticipants > 0 
    ? Math.round((attendedCount / totalParticipants) * 1000) / 10 
    : 0;

  const completionRate = totalParticipants > 0 
    ? Math.round((completedCount / totalParticipants) * 1000) / 10 
    : 0;

  const responseRate = totalParticipants > 0 
    ? Math.round((respondentsCount / totalParticipants) * 1000) / 10 
    : 0;

  return {
    totalParticipants,
    attendedCount,
    absentCount,
    notCheckedCount,
    completedCount,
    notCompletedCount,
    pendingCount,
    attendanceRate,
    completionRate,
    respondentsCount,
    responseRate
  };
};

export interface DashboardOverviewStats {
  totalProgramsCount: number;
  operatingProgramsCount: number;
  completedProgramsCount: number;
  totalParticipantsCount: number;
  totalCompletedCount: number;
  overallResponseRate: number;
  overallAverageSatisfaction: number;
}

export const calculateDashboardStats = (programs: Program[], allParticipants: Participant[]): DashboardOverviewStats => {
  const totalProgramsCount = programs.length;
  const operatingProgramsCount = programs.filter(p => p.status === "Operating").length;
  const completedProgramsCount = programs.filter(p => p.status === "Completed" || p.status === "Report Drafted").length;
  
  const totalParticipantsCount = allParticipants.length;
  const totalCompletedCount = allParticipants.filter(p => p.completionStatus === "Completed").length;

  // Survey stats
  let totalRespondents = 0;
  let satisfactionSum = 0;
  let satisfactionCount = 0;

  programs.forEach(p => {
    if (p.surveySummary) {
      totalRespondents += p.surveySummary.respondents;
      if (p.surveySummary.averageOverallSatisfaction > 0) {
        satisfactionSum += p.surveySummary.averageOverallSatisfaction;
        satisfactionCount++;
      }
    }
  });

  const overallResponseRate = totalParticipantsCount > 0 
    ? Math.round((totalRespondents / totalParticipantsCount) * 1000) / 10 
    : 0;

  const overallAverageSatisfaction = satisfactionCount > 0
    ? Math.round((satisfactionSum / satisfactionCount) * 100) / 100
    : 0;

  return {
    totalProgramsCount,
    operatingProgramsCount,
    completedProgramsCount,
    totalParticipantsCount,
    totalCompletedCount,
    overallResponseRate,
    overallAverageSatisfaction
  };
};
