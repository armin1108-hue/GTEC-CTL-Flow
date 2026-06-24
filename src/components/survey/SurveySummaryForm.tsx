import React, { useState, useEffect } from "react";
import type { Program, SurveySummary } from "../../types/program";
import { Save, QrCode, ExternalLink, RefreshCw } from "lucide-react";

interface SurveySummaryFormProps {
  program: Program;
  totalParticipants: number;
  onSaveSurvey: (survey: SurveySummary) => void;
}

export const SurveySummaryForm: React.FC<SurveySummaryFormProps> = ({
  program,
  totalParticipants,
  onSaveSurvey,
}) => {
  const [formData, setFormData] = useState<Partial<SurveySummary>>({
    surveyTarget: "수강생 전체",
    surveyStartDate: "",
    surveyEndDate: "",
    surveyLink: "",
    qrCodeUrl: "",
    totalParticipants: 0,
    respondents: 0,
    responseRate: 0,
    averageOverallSatisfaction: 0,
    averageRecommendScore: 0,
    averageContentScore: 0,
    averageOperationScore: 0,
    averageLearningOutcomeScore: 0,
    averageAiEthicsScore: 0,
    positiveComments: [],
    improvementComments: [],
    requestedFutureTopics: [],
  });

  // Textarea inputs mapping (one item per line)
  const [posCommentsText, setPosCommentsText] = useState("");
  const [impCommentsText, setImpCommentsText] = useState("");
  const [futureTopicsText, setFutureTopicsText] = useState("");

  useEffect(() => {
    if (program.surveySummary) {
      setFormData(program.surveySummary);
      setPosCommentsText(program.surveySummary.positiveComments.join("\n"));
      setImpCommentsText(program.surveySummary.improvementComments.join("\n"));
      setFutureTopicsText(program.surveySummary.requestedFutureTopics.join("\n"));
    } else {
      setFormData({
        programId: program.id,
        surveyTarget: "수강생 전체",
        surveyStartDate: program.startDate,
        surveyEndDate: program.endDate,
        surveyLink: "",
        qrCodeUrl: "",
        totalParticipants: totalParticipants,
        respondents: 0,
        responseRate: 0,
        averageOverallSatisfaction: 4.5,
        averageRecommendScore: 4.5,
        averageContentScore: 4.5,
        averageOperationScore: 4.5,
        averageLearningOutcomeScore: 4.5,
        averageAiEthicsScore: program.type === "AI Education" ? 4.5 : 0,
        positiveComments: [],
        improvementComments: [],
        requestedFutureTopics: [],
      });
      setPosCommentsText("");
      setImpCommentsText("");
      setFutureTopicsText("");
    }
  }, [program, totalParticipants]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: name.startsWith("average") || name === "respondents"
          ? (value ? parseFloat(value) : 0)
          : value,
      };

      // Auto response rate calculation
      if (name === "respondents") {
        const respCount = parseInt(value) || 0;
        updated.responseRate = totalParticipants > 0
          ? Math.round((respCount / totalParticipants) * 1000) / 10
          : 0;
      }

      return updated;
    });
  };

  const handleGenerateQR = () => {
    if (!formData.surveyLink) {
      alert("QR 코드를 생성하려면 먼저 만족도 조사 링크를 입력해 주세요.");
      return;
    }
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      formData.surveyLink
    )}`;
    setFormData((prev) => ({ ...prev, qrCodeUrl: qrUrl }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parseLines = (text: string) => 
      text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    const surveyData: SurveySummary = {
      programId: program.id,
      surveyTarget: formData.surveyTarget || "수강생 전체",
      surveyStartDate: formData.surveyStartDate || program.startDate,
      surveyEndDate: formData.surveyEndDate || program.endDate,
      surveyLink: formData.surveyLink || "",
      qrCodeUrl: formData.qrCodeUrl || "",
      totalParticipants,
      respondents: formData.respondents || 0,
      responseRate: totalParticipants > 0
        ? Math.round(((formData.respondents || 0) / totalParticipants) * 1000) / 10
        : 0,
      averageOverallSatisfaction: formData.averageOverallSatisfaction || 0,
      averageRecommendScore: formData.averageRecommendScore || 0,
      averageContentScore: formData.averageContentScore || 0,
      averageOperationScore: formData.averageOperationScore || 0,
      averageLearningOutcomeScore: formData.averageLearningOutcomeScore || 0,
      averageAiEthicsScore: program.type === "AI Education" ? (formData.averageAiEthicsScore || 0) : 0,
      positiveComments: parseLines(posCommentsText),
      improvementComments: parseLines(impCommentsText),
      requestedFutureTopics: parseLines(futureTopicsText),
    };

    onSaveSurvey(surveyData);
    alert("만족도 조사 결과 요약이 성공적으로 저장되었습니다.");
  };

  return (
    <div className="space-y-6">
      {/* Satisfaction Average Cards View */}
      {program.surveySummary && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h3 className="text-xs font-bold text-slate-400 mb-4">현재 만족도 평균 지표 (5.0 만점)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "전반 만족도", val: program.surveySummary.averageOverallSatisfaction, color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
              { label: "추천 의향", val: program.surveySummary.averageRecommendScore, color: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
              { label: "교육내용 만족도", val: program.surveySummary.averageContentScore, color: "text-sky-400 border-sky-500/20 bg-sky-500/5" },
              { label: "교육운영 만족도", val: program.surveySummary.averageOperationScore, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" },
              { label: "학습성과 인식", val: program.surveySummary.averageLearningOutcomeScore, color: "text-teal-400 border-teal-500/20 bg-teal-500/5" },
              ...(program.type === "AI Education" ? [
                { label: "AI 윤리 이해도", val: program.surveySummary.averageAiEthicsScore, color: "text-purple-400 border-purple-500/20 bg-purple-500/5" }
              ] : [])
            ].map((metric, idx) => (
              <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${metric.color}`}>
                <span className="text-3xs font-semibold opacity-80 mb-2">{metric.label}</span>
                <span className="text-xl font-extrabold tracking-tight">{metric.val.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200">만족도 조사 결과 및 요약 설정</h3>
          <span className="text-xs text-slate-400">참여자 총원: {totalParticipants}명</span>
        </div>

        {/* Survey Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">조사 대상</label>
            <input
              type="text"
              name="surveyTarget"
              value={formData.surveyTarget || ""}
              onChange={handleChange}
              placeholder="예: 수강생 전체"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">설문 시작일</label>
            <input
              type="date"
              name="surveyStartDate"
              value={formData.surveyStartDate || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">설문 종료일</label>
            <input
              type="date"
              name="surveyEndDate"
              value={formData.surveyEndDate || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Link and QR Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">구글폼 만족도 설문 링크</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="surveyLink"
                  value={formData.surveyLink || ""}
                  onChange={handleChange}
                  placeholder="https://docs.google.com/forms/..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
                {formData.surveyLink && (
                  <a
                    href={formData.surveyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center justify-center"
                    title="설문 열기"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">설문 응답자 수</label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  name="respondents"
                  min={0}
                  max={totalParticipants}
                  value={formData.respondents ?? ""}
                  onChange={handleChange}
                  className="w-32 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-400 font-medium">
                  응답률: <strong className="text-slate-200">{formData.responseRate}%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* QR Display Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-2xs font-bold text-slate-400 flex items-center">
              <QrCode className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
              설문지 접속 QR 코드
            </span>
            <div className="h-32 w-32 border border-slate-800 bg-white rounded-lg flex items-center justify-center overflow-hidden">
              {formData.qrCodeUrl ? (
                <img src={formData.qrCodeUrl} alt="Survey QR Code" className="h-28 w-28 object-contain" />
              ) : (
                <span className="text-4xs text-slate-400 px-3">QR 미생성</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleGenerateQR}
              className="inline-flex items-center px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-3xs font-semibold text-slate-300 rounded-lg transition"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              QR 코드 생성/동기화
            </button>
          </div>
        </div>

        {/* Scoring input row */}
        <div className="border-t border-slate-800 pt-5">
          <h4 className="text-xs font-bold text-slate-300 mb-4">문항별 평균 점수 수동 입력 (5점 척도)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-4xs font-bold text-slate-400 mb-1">전반 만족도</label>
              <input
                type="number"
                name="averageOverallSatisfaction"
                step="0.01"
                min="0"
                max="5"
                value={formData.averageOverallSatisfaction ?? ""}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-4xs font-bold text-slate-400 mb-1">추천 의향</label>
              <input
                type="number"
                name="averageRecommendScore"
                step="0.01"
                min="0"
                max="5"
                value={formData.averageRecommendScore ?? ""}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-4xs font-bold text-slate-400 mb-1">교육내용 만족도</label>
              <input
                type="number"
                name="averageContentScore"
                step="0.01"
                min="0"
                max="5"
                value={formData.averageContentScore ?? ""}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-4xs font-bold text-slate-400 mb-1">교육운영 만족도</label>
              <input
                type="number"
                name="averageOperationScore"
                step="0.01"
                min="0"
                max="5"
                value={formData.averageOperationScore ?? ""}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-4xs font-bold text-slate-400 mb-1">학습성과 인식</label>
              <input
                type="number"
                name="averageLearningOutcomeScore"
                step="0.01"
                min="0"
                max="5"
                value={formData.averageLearningOutcomeScore ?? ""}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            {program.type === "AI Education" && (
              <div>
                <label className="block text-4xs font-bold text-slate-400 mb-1">AI 윤리 이해도</label>
                <input
                  type="number"
                  name="averageAiEthicsScore"
                  step="0.01"
                  min="0"
                  max="5"
                  value={formData.averageAiEthicsScore ?? ""}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-rose-950 focus:border-rose-700 rounded-lg text-xs text-slate-200 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Qualitative Responses (Textareas) */}
        <div className="border-t border-slate-800 pt-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-300">서술형 의견 및 요약 (한 줄에 의견 하나씩 작성)</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-4xs font-bold text-emerald-400 mb-1.5">긍정적 의견</label>
              <textarea
                rows={4}
                value={posCommentsText}
                onChange={(e) => setPosCommentsText(e.target.value)}
                placeholder="예: 프롬프트 실습이 유익했다&#10;강의 내용이 친절했다"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-650"
              />
            </div>
            
            <div>
              <label className="block text-4xs font-bold text-rose-400 mb-1.5">개선 및 요구사항</label>
              <textarea
                rows={4}
                value={impCommentsText}
                onChange={(e) => setImpCommentsText(e.target.value)}
                placeholder="예: 실습 시간이 부족했다&#10;전공과 밀접한 예시가 적었다"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-650"
              />
            </div>

            <div>
              <label className="block text-4xs font-bold text-indigo-400 mb-1.5">향후 희망 주제</label>
              <textarea
                rows={4}
                value={futureTopicsText}
                onChange={(e) => setFutureTopicsText(e.target.value)}
                placeholder="예: AI 활용 작문법&#10;프롬프트 심화과정"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-650"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all duration-150"
          >
            <Save className="h-4 w-4 mr-2" />
            만족도 조사 정보 저장
          </button>
        </div>
      </form>
    </div>
  );
};
