import type { Program, Participant, SurveySummary } from "../types/program";

export const mockSurveySummary: SurveySummary = {
  programId: "AI-2026-001",
  surveyTarget: "수강생 전체",
  surveyStartDate: "2026-06-23",
  surveyEndDate: "2026-06-30",
  surveyLink: "https://docs.google.com/forms/d/e/1FAIpQLSdw1zYVvKq65Z4QGTEC-CTL-Flow/viewform",
  qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://docs.google.com/forms/d/e/1FAIpQLSdw1zYVvKq65Z4QGTEC-CTL-Flow/viewform",
  totalParticipants: 30,
  respondents: 28,
  responseRate: 93.3,
  averageOverallSatisfaction: 4.54,
  averageRecommendScore: 4.54,
  averageContentScore: 4.57,
  averageOperationScore: 4.54,
  averageLearningOutcomeScore: 4.57,
  averageAiEthicsScore: 4.64,
  positiveComments: [
    "프롬프트 작성 실습이 유익했다.",
    "보고서 초안 작성 실습이 도움이 되었다.",
    "발표자료 제작 예시가 실용적이었다.",
    "AI 윤리와 개인정보 보호 안내가 의미 있었다.",
    "취업·진로와 연계한 AI 활용 예시가 좋았다."
  ],
  improvementComments: [
    "실습 시간이 더 필요하다.",
    "전공별 사례가 더 필요하다.",
    "초보자를 위한 기초 설명이 강화되면 좋겠다.",
    "실습자료를 사전에 제공하면 좋겠다."
  ],
  requestedFutureTopics: [
    "전공별 AI 활용 사례",
    "프롬프트 심화 실습",
    "AI 기반 과제 작성",
    "취업 준비를 위한 AI 활용",
    "AI 윤리와 저작권"
  ]
};

export const mockProgram: Program = {
  id: "AI-2026-001",
  name: "AI활용교육프로그램",
  type: "AI Education",
  purpose:
    "학생들이 생성형 AI 도구를 학습, 과제 수행, 발표 준비, 정보 정리, 윤리적 AI 활용에 적용할 수 있도록 지원한다.",
  targetGroup: "AI활용교육프로그램 수강생 전체",
  startDate: "2026-06-23",
  endDate: "2026-06-30",
  locationOrMethod: "오프라인 / 실습형 워크숍",
  manager: "교수학습지원센터",
  maxParticipants: 30,
  description:
    "프롬프트 작성, 보고서 초안 작성, 발표자료 제작 지원, AI 윤리, 개인정보 보호를 포함한 학생 대상 실습형 AI활용교육 프로그램이다.",
  status: "Completed",
  surveySummary: mockSurveySummary,
  createdAt: "2026-06-23T09:00:00.000Z",
  updatedAt: "2026-06-30T18:00:00.000Z"
};

// Generate 30 mock participants
const grades = ["1학년", "2학년", "3학년"];
const majors = ["공학계열", "자연과학계열", "인문사회계열", "예체능계열"];

// We need 28 survey respondents. Let's make P001 to P028 surveySubmitted = true.
// The average should be roughly:
// overallSatisfaction: sixteen 5s, eleven 4s, one 3 -> 127 / 28 = 4.5357 (4.54)
// recommendScore: sixteen 5s, eleven 4s, one 3 -> 127 / 28 = 4.54
const satisfactionScores = [
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, // 16 fives
  4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,                // 11 fours
  3                                               // 1 three
];

export const mockParticipants: Participant[] = Array.from({ length: 30 }, (_, index) => {
  const idNum = index + 1;
  const pCode = `P${String(idNum).padStart(3, "0")}`;
  const isRespondent = idNum <= 28;

  // Distribute majors & grades deterministically
  const grade = grades[index % grades.length];
  const majorGroup = majors[index % majors.length];

  // For the MVP scenario, P001-P029 are Attended, P030 is Absent
  const attendanceStatus = idNum === 30 ? "Absent" : "Attended";
  const completionStatus = idNum === 30 ? "Not Completed" : "Completed";

  return {
    id: `part-${pCode}`,
    programId: "AI-2026-001",
    participantCode: pCode,
    grade,
    majorGroup,
    applicationStatus: "Selected",
    attendanceStatus,
    completionStatus,
    surveySubmitted: isRespondent,
    overallSatisfaction: isRespondent ? satisfactionScores[index] : undefined,
    recommendScore: isRespondent ? satisfactionScores[index] : undefined,
    note: idNum === 30 ? "개인 사정 불참" : undefined
  };
});

export const initialPrograms: Program[] = [mockProgram];
export const initialParticipants: Participant[] = [...mockParticipants];
