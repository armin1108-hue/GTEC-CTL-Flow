export type ProgramType =
  | "AI Education"
  | "Teaching Support"
  | "Learning Support"
  | "Tutoring"
  | "Learning Community"
  | "Faculty Workshop"
  | "Online Learning Support"
  | "Other";

export type ProgramStatus =
  | "Planning"
  | "Recruiting"
  | "Operating"
  | "Completed"
  | "Report Drafted"
  | "Archived";

export type ApplicationStatus =
  | "Applied"
  | "Selected"
  | "Waiting"
  | "Cancelled";

export type AttendanceStatus =
  | "Attended"
  | "Absent"
  | "Not Checked";

export type CompletionStatus =
  | "Completed"
  | "Not Completed"
  | "Pending";

export interface Participant {
  id: string;
  programId: string;
  participantCode: string;
  grade: string;
  majorGroup: string;
  applicationStatus: ApplicationStatus;
  attendanceStatus: AttendanceStatus;
  completionStatus: CompletionStatus;
  surveySubmitted: boolean;
  overallSatisfaction?: number;
  recommendScore?: number;
  note?: string;
}

export interface SurveySummary {
  programId: string;
  surveyTarget: string;
  surveyStartDate: string;
  surveyEndDate: string;
  surveyLink: string;
  qrCodeUrl?: string;
  totalParticipants: number;
  respondents: number;
  responseRate: number;
  averageOverallSatisfaction: number;
  averageRecommendScore: number;
  averageContentScore: number;
  averageOperationScore: number;
  averageLearningOutcomeScore: number;
  averageAiEthicsScore: number;
  positiveComments: string[];
  improvementComments: string[];
  requestedFutureTopics: string[];
}

export interface Program {
  id: string;
  name: string;
  type: ProgramType;
  purpose: string;
  targetGroup: string;
  startDate: string;
  endDate: string;
  locationOrMethod: string;
  manager: string;
  maxParticipants?: number;
  description?: string;
  status: ProgramStatus;
  surveySummary?: SurveySummary;
  createdAt: string;
  updatedAt: string;
}
