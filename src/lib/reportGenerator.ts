import type { Program, Participant } from "../types/program";
import { calculateProgramStats } from "./calculations";

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

export const generateReportText = (program: Program, participants: Participant[]): string => {
  const stats = calculateProgramStats(participants);
  const typeKo = PROGRAM_TYPE_KO[program.type] || program.type;

  let report = `[프로그램 운영 결과보고서 초안]\n\n`;

  // 1. 프로그램 개요
  report += `1. 프로그램 개요\n`;
  report += `- 프로그램명: ${program.name}\n`;
  report += `- 프로그램 유형: ${typeKo}\n`;
  report += `- 운영 대상: ${program.targetGroup}\n`;
  report += `- 운영 기간: ${program.startDate} ~ ${program.endDate}\n`;
  report += `- 운영 방식: ${program.locationOrMethod}\n`;
  report += `- 담당 부서/담당자: ${program.manager}\n\n`;

  // 2. 운영 목적
  report += `2. 운영 목적\n`;
  report += `${program.purpose || "학생들이 학습, 과제 수행, 발표 준비, 정보 정리 및 윤리적 AI 활용 능력을 키울 수 있도록 운영함."}\n\n`;

  // 3. 참여 결과
  report += `3. 참여 결과\n`;
  report += `- 전체 참여자 수: ${stats.totalParticipants}명\n`;
  report += `- 참석자 수: ${stats.attendedCount}명 (출석률: ${stats.attendanceRate}%)\n`;
  report += `- 수료자 수: ${stats.completedCount}명\n`;
  report += `- 수료율: ${stats.completionRate}%\n\n`;

  // 4. 만족도 조사 개요
  if (program.surveySummary) {
    const survey = program.surveySummary;
    report += `4. 만족도 조사 개요\n`;
    report += `- 조사대상: ${survey.surveyTarget}\n`;
    report += `- 조사기간: ${survey.surveyStartDate} ~ ${survey.surveyEndDate}\n`;
    report += `- 응답자 수: ${survey.respondents}명\n`;
    report += `- 응답률: ${survey.responseRate}%\n\n`;

    // 5. 주요 만족도 결과
    report += `5. 주요 만족도 결과\n`;
    report += `- 전반 만족도: ${survey.averageOverallSatisfaction} / 5.00\n`;
    report += `- 추천 의향: ${survey.averageRecommendScore} / 5.00\n`;
    report += `- 교육내용 만족도: ${survey.averageContentScore} / 5.00\n`;
    report += `- 교육운영 만족도: ${survey.averageOperationScore} / 5.00\n`;
    report += `- 학습성과 인식: ${survey.averageLearningOutcomeScore} / 5.00\n`;
    if (program.type === "AI Education" || survey.averageAiEthicsScore > 0) {
      report += `- AI 윤리 이해도: ${survey.averageAiEthicsScore} / 5.00\n`;
    }
    report += `\n`;

    // 6. 긍정 의견
    report += `6. 긍정 의견\n`;
    if (survey.positiveComments && survey.positiveComments.length > 0) {
      survey.positiveComments.forEach((comment) => {
        report += `- ${comment}\n`;
      });
    } else {
      report += `- 등록된 긍정 의견이 없습니다.\n`;
    }
    report += `\n`;

    // 7. 개선 요구
    report += `7. 개선 요구\n`;
    if (survey.improvementComments && survey.improvementComments.length > 0) {
      survey.improvementComments.forEach((comment) => {
        report += `- ${comment}\n`;
      });
    } else {
      report += `- 등록된 개선 요구 사항이 없습니다.\n`;
    }
    report += `\n`;

    // 8. 향후 개선계획
    report += `8. 향후 개선계획\n`;
    report += `만족도 조사 결과를 바탕으로 다음과 같은 개선 사항을 추진할 필요가 있음:\n`;
    
    // Customize or use default items based on survey topics
    if (survey.requestedFutureTopics && survey.requestedFutureTopics.length > 0) {
      survey.requestedFutureTopics.forEach((topic) => {
        report += `- 향후 희망 주제인 '${topic}' 관련 심화 교육 과정을 신설함.\n`;
      });
    }
    
    // Add default actions based on typical feedback
    report += `- 전공계열별 실무 AI 활용 사례 교육을 확대함.\n`;
    report += `- 실습 비중을 고려하여 실습 및 질의응답 시간을 확대 편성함.\n`;
    report += `- 학생 수준별(초급/심화) 분반 운영을 도입하여 학습 효과를 극대화함.\n`;
    report += `- 실습자료 및 소프트웨어 라이선스를 프로그램 시작 전 사전 제공하여 준비성을 높임.\n`;
    report += `- AI 활용 윤리, 저작권, 데이터 개인정보 보호 안내 세션을 강화함.\n\n`;

  } else {
    report += `4. 만족도 조사 개요\n- 만족도 조사 정보가 등록되지 않았습니다.\n\n`;
    report += `5. 주요 만족도 결과\n- 만족도 조사 정보가 등록되지 않았습니다.\n\n`;
    report += `6. 긍정 의견\n- 의견 없음\n\n`;
    report += `7. 개선 요구\n- 의견 없음\n\n`;
    report += `8. 향후 개선계획\n- 추후 만족도 조사 분석 후 보완 예정\n\n`;
  }

  // 9. 행정 참고사항
  report += `9. 행정 참고사항\n`;
  report += `본 결과보고서 초안은 입력된 데이터를 기반으로 자동 생성되었습니다. 공식 활용 전 반드시 담당자가 내용을 검토하고 승인해야 합니다.\n`;

  return report;
};
