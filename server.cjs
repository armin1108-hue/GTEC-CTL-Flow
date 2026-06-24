const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

// Security: Helmet configurations
app.use(
  helmet({
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://api.qrserver.com"],
            connectSrc: ["'self'"],
          },
        }
      : false, // In dev, disable tight CSP to allow Vite HMR sockets if serving combined
  })
);

// CORS setup: restrict in production, open to dev server in development
const corsOptions = {
  origin: isProd ? false : "http://localhost:5173",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// PII Prevention middleware: checks if any request tries to upload real names, real IDs, or phone numbers
app.use((req, res, next) => {
  const piiFields = ["name", "studentId", "phone", "email", "contact", "realName", "학번", "이름", "전화번호"];
  const checkBody = (obj) => {
    if (!obj || typeof obj !== "object") return false;
    for (const key in obj) {
      if (piiFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        return true;
      }
      if (typeof obj[key] === "object" && checkBody(obj[key])) {
        return true;
      }
    }
    return false;
  };

  if (checkBody(req.body)) {
    return res.status(400).json({
      error: "Security Violation: Personal Identifiable Information (PII) such as names, phone numbers, or actual student IDs cannot be uploaded to this MVP.",
    });
  }
  next();
});

// XSS/HTML Injection prevention utility
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === "object") {
      obj[key] = sanitizeObject(obj[key]);
    }
  }
  return obj;
};

// Apply sanitization middleware
app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// Database setup
let db;

async function initDb() {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "database.sqlite");
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      purpose TEXT,
      targetGroup TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      locationOrMethod TEXT,
      manager TEXT,
      maxParticipants INTEGER,
      description TEXT,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS survey_summaries (
      programId TEXT PRIMARY KEY,
      surveyTarget TEXT NOT NULL,
      surveyStartDate TEXT NOT NULL,
      surveyEndDate TEXT NOT NULL,
      surveyLink TEXT,
      qrCodeUrl TEXT,
      totalParticipants INTEGER NOT NULL,
      respondents INTEGER NOT NULL,
      responseRate REAL NOT NULL,
      averageOverallSatisfaction REAL NOT NULL,
      averageRecommendScore REAL NOT NULL,
      averageContentScore REAL NOT NULL,
      averageOperationScore REAL NOT NULL,
      averageLearningOutcomeScore REAL NOT NULL,
      averageAiEthicsScore REAL NOT NULL,
      positiveComments TEXT NOT NULL,
      improvementComments TEXT NOT NULL,
      requestedFutureTopics TEXT NOT NULL,
      FOREIGN KEY (programId) REFERENCES programs (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      programId TEXT NOT NULL,
      participantCode TEXT NOT NULL,
      grade TEXT NOT NULL,
      majorGroup TEXT NOT NULL,
      applicationStatus TEXT NOT NULL,
      attendanceStatus TEXT NOT NULL,
      completionStatus TEXT NOT NULL,
      surveySubmitted INTEGER NOT NULL DEFAULT 0,
      overallSatisfaction INTEGER,
      recommendScore INTEGER,
      note TEXT,
      FOREIGN KEY (programId) REFERENCES programs (id) ON DELETE CASCADE,
      UNIQUE(programId, participantCode)
    );
  `);

  // Seed default data if database is empty
  const count = await db.get("SELECT COUNT(*) as count FROM programs");
  if (count.count === 0) {
    console.log("Database empty. Seeding initial GTEC CTL-Flow mock data...");
    await seedDefaultData();
  }
}

async function seedDefaultData() {
  const mockProgram = {
    id: "AI-2026-001",
    name: "AI활용교육프로그램",
    type: "AI Education",
    purpose: "학생들이 생성형 AI 도구를 학습, 과제 수행, 발표 준비, 정보 정리, 윤리적 AI 활용에 적용할 수 있도록 지원한다.",
    targetGroup: "AI활용교육프로그램 수강생 전체",
    startDate: "2026-06-23",
    endDate: "2026-06-30",
    locationOrMethod: "오프라인 / 실습형 워크숍",
    manager: "교수학습지원센터",
    maxParticipants: 30,
    description: "프롬프트 작성, 보고서 초안 작성, 발표자료 제작 지원, AI 윤리, 개인정보 보호를 포함한 학생 대상 실습형 AI활용교육 프로그램이다.",
    status: "Completed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSurvey = {
    programId: "AI-2026-001",
    surveyTarget: "수강생 전체",
    surveyStartDate: "2026-06-23",
    surveyEndDate: "2026-06-30",
    surveyLink: "https://docs.google.com/forms/",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://docs.google.com/forms/",
    totalParticipants: 30,
    respondents: 28,
    responseRate: 93.3,
    averageOverallSatisfaction: 4.54,
    averageRecommendScore: 4.54,
    averageContentScore: 4.57,
    averageOperationScore: 4.54,
    averageLearningOutcomeScore: 4.57,
    averageAiEthicsScore: 4.64,
    positiveComments: JSON.stringify([
      "프롬프트 작성 실습이 유익했다.",
      "보고서 초안 작성 실습이 도움이 되었다.",
      "발표자료 제작 예시가 실용적이었다.",
      "AI 윤리와 개인정보 보호 안내가 의미 있었다.",
      "취업·진로와 연계한 AI 활용 예시가 좋았다."
    ]),
    improvementComments: JSON.stringify([
      "실습 시간이 더 필요하다.",
      "전공별 사례가 더 필요하다.",
      "초보자를 위한 기초 설명이 강화되면 좋겠다.",
      "실습자료를 사전에 제공하면 좋겠다."
    ]),
    requestedFutureTopics: JSON.stringify([
      "전공별 AI 활용 사례",
      "프롬프트 심화 실습",
      "AI 기반 과제 작성",
      "취업 준비를 위한 AI 활용",
      "AI 윤리와 저작권"
    ]),
  };

  // Seed Program
  await db.run(
    `INSERT INTO programs (id, name, type, purpose, targetGroup, startDate, endDate, locationOrMethod, manager, maxParticipants, description, status, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      mockProgram.id,
      mockProgram.name,
      mockProgram.type,
      mockProgram.purpose,
      mockProgram.targetGroup,
      mockProgram.startDate,
      mockProgram.endDate,
      mockProgram.locationOrMethod,
      mockProgram.manager,
      mockProgram.maxParticipants,
      mockProgram.description,
      mockProgram.status,
      mockProgram.createdAt,
      mockProgram.updatedAt,
    ]
  );

  // Seed Survey
  await db.run(
    `INSERT INTO survey_summaries (programId, surveyTarget, surveyStartDate, surveyEndDate, surveyLink, qrCodeUrl, totalParticipants, respondents, responseRate, averageOverallSatisfaction, averageRecommendScore, averageContentScore, averageOperationScore, averageLearningOutcomeScore, averageAiEthicsScore, positiveComments, improvementComments, requestedFutureTopics) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      mockSurvey.programId,
      mockSurvey.surveyTarget,
      mockSurvey.surveyStartDate,
      mockSurvey.surveyEndDate,
      mockSurvey.surveyLink,
      mockSurvey.qrCodeUrl,
      mockSurvey.totalParticipants,
      mockSurvey.respondents,
      mockSurvey.responseRate,
      mockSurvey.averageOverallSatisfaction,
      mockSurvey.averageRecommendScore,
      mockSurvey.averageContentScore,
      mockSurvey.averageOperationScore,
      mockSurvey.averageLearningOutcomeScore,
      mockSurvey.averageAiEthicsScore,
      mockSurvey.positiveComments,
      mockSurvey.improvementComments,
      mockSurvey.requestedFutureTopics,
    ]
  );

  // Seed 30 participants
  const grades = ["1학년", "2학년", "3학년"];
  const majors = ["공학계열", "자연과학계열", "인문사회계열", "예체능계열"];
  const satisfactionScores = [
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, // 16 fives
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,                // 11 fours
    3,                                              // 1 three
  ];

  for (let i = 0; i < 30; i++) {
    const idNum = i + 1;
    const pCode = `P${String(idNum).padStart(3, "0")}`;
    const isRespondent = idNum <= 28;

    const grade = grades[i % grades.length];
    const majorGroup = majors[i % majors.length];
    const attendanceStatus = idNum === 30 ? "Absent" : "Attended";
    const completionStatus = idNum === 30 ? "Not Completed" : "Completed";

    await db.run(
      `INSERT INTO participants (id, programId, participantCode, grade, majorGroup, applicationStatus, attendanceStatus, completionStatus, surveySubmitted, overallSatisfaction, recommendScore, note) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `part-${pCode}`,
        "AI-2026-001",
        pCode,
        grade,
        majorGroup,
        "Selected",
        attendanceStatus,
        completionStatus,
        isRespondent ? 1 : 0,
        isRespondent ? satisfactionScores[i] : null,
        isRespondent ? satisfactionScores[i] : null,
        idNum === 30 ? "개인 사정 불참" : null,
      ]
    );
  }
}

// ----------------- API Endpoints -----------------

// Helper to bundle program with its survey summary
async function getFullProgram(programId) {
  const program = await db.get("SELECT * FROM programs WHERE id = ?", [programId]);
  if (!program) return null;

  const survey = await db.get("SELECT * FROM survey_summaries WHERE programId = ?", [programId]);
  if (survey) {
    survey.positiveComments = JSON.parse(survey.positiveComments);
    survey.improvementComments = JSON.parse(survey.improvementComments);
    survey.requestedFutureTopics = JSON.parse(survey.requestedFutureTopics);
    program.surveySummary = survey;
  }
  return program;
}

// REST 1: Get Programs
app.get("/api/programs", async (req, res) => {
  try {
    const programsList = await db.all("SELECT id FROM programs");
    const fullPrograms = [];
    for (const p of programsList) {
      const full = await getFullProgram(p.id);
      if (full) fullPrograms.push(full);
    }
    res.json(fullPrograms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// REST 2: Get Program By ID
app.get("/api/programs/:id", async (req, res) => {
  try {
    const full = await getFullProgram(req.params.id);
    if (!full) return res.status(404).json({ error: "Program not found" });
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch program detail" });
  }
});

// REST 3: Save Program (Insert or Update)
app.post("/api/programs", async (req, res) => {
  try {
    const {
      id,
      name,
      type,
      purpose,
      targetGroup,
      startDate,
      endDate,
      locationOrMethod,
      manager,
      maxParticipants,
      description,
      status,
    } = req.body;

    if (!id || !name || !type || !targetGroup || !startDate || !endDate || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await db.get("SELECT id FROM programs WHERE id = ?", [id]);
    const now = new Date().toISOString();

    if (existing) {
      // Update
      await db.run(
        `UPDATE programs SET 
          name = ?, type = ?, purpose = ?, targetGroup = ?, startDate = ?, endDate = ?, 
          locationOrMethod = ?, manager = ?, maxParticipants = ?, description = ?, status = ?, updatedAt = ?
         WHERE id = ?`,
        [name, type, purpose, targetGroup, startDate, endDate, locationOrMethod, manager, maxParticipants, description, status, now, id]
      );
    } else {
      // Insert
      await db.run(
        `INSERT INTO programs 
          (id, name, type, purpose, targetGroup, startDate, endDate, locationOrMethod, manager, maxParticipants, description, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, type, purpose, targetGroup, startDate, endDate, locationOrMethod, manager, maxParticipants, description, status, now, now]
      );
    }

    const saved = await getFullProgram(id);
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save program" });
  }
});

// REST 4: Delete Program
app.delete("/api/programs/:id", async (req, res) => {
  try {
    await db.run("PRAGMA foreign_keys = ON");
    const result = await db.run("DELETE FROM programs WHERE id = ?", [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Program not found" });
    }
    res.json({ message: "Program and all associated records deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete program" });
  }
});

// REST 5: Get Participants
app.get("/api/participants", async (req, res) => {
  try {
    const { programId } = req.query;
    let query = "SELECT * FROM participants";
    const params = [];

    if (programId) {
      query += " WHERE programId = ?";
      params.push(programId);
    }

    const list = await db.all(query, params);
    const mapped = list.map((p) => ({
      ...p,
      surveySubmitted: p.surveySubmitted === 1,
      overallSatisfaction: p.overallSatisfaction !== null ? p.overallSatisfaction : undefined,
      recommendScore: p.recommendScore !== null ? p.recommendScore : undefined,
      note: p.note !== null ? p.note : undefined,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// REST 6: Save Participant (Insert or Update)
app.post("/api/participants", async (req, res) => {
  try {
    const {
      id,
      programId,
      participantCode,
      grade,
      majorGroup,
      applicationStatus,
      attendanceStatus,
      completionStatus,
      surveySubmitted,
      overallSatisfaction,
      recommendScore,
      note,
    } = req.body;

    if (!id || !programId || !participantCode || !grade || !majorGroup || !applicationStatus || !attendanceStatus || !completionStatus) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await db.get("SELECT id FROM participants WHERE id = ?", [id]);
    
    const codeRegex = /^P[0-9]{3,5}$/i;
    if (!codeRegex.test(participantCode)) {
      return res.status(400).json({ error: "Invalid Participant Code pattern (Use e.g., P001)" });
    }

    if (existing) {
      await db.run(
        `UPDATE participants SET 
          programId = ?, participantCode = ?, grade = ?, majorGroup = ?, 
          applicationStatus = ?, attendanceStatus = ?, completionStatus = ?, 
          surveySubmitted = ?, overallSatisfaction = ?, recommendScore = ?, note = ?
         WHERE id = ?`,
        [
          programId,
          participantCode,
          grade,
          majorGroup,
          applicationStatus,
          attendanceStatus,
          completionStatus,
          surveySubmitted ? 1 : 0,
          overallSatisfaction !== undefined ? overallSatisfaction : null,
          recommendScore !== undefined ? recommendScore : null,
          note !== undefined ? note : null,
          id,
        ]
      );
    } else {
      const duplicateCode = await db.get("SELECT id FROM participants WHERE programId = ? AND participantCode = ?", [programId, participantCode]);
      if (duplicateCode) {
        return res.status(400).json({ error: "Participant code already exists in this program" });
      }

      await db.run(
        `INSERT INTO participants 
          (id, programId, participantCode, grade, majorGroup, applicationStatus, attendanceStatus, completionStatus, surveySubmitted, overallSatisfaction, recommendScore, note) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          programId,
          participantCode,
          grade,
          majorGroup,
          applicationStatus,
          attendanceStatus,
          completionStatus,
          surveySubmitted ? 1 : 0,
          overallSatisfaction !== undefined ? overallSatisfaction : null,
          recommendScore !== undefined ? recommendScore : null,
          note !== undefined ? note : null,
        ]
      );
    }

    await syncProgramStats(programId);

    const saved = await db.get("SELECT * FROM participants WHERE id = ?", [id]);
    saved.surveySubmitted = saved.surveySubmitted === 1;
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save participant" });
  }
});

// REST 7: Save Participants Bulk
app.post("/api/participants/bulk", async (req, res) => {
  try {
    const list = req.body;
    if (!Array.isArray(list)) {
      return res.status(400).json({ error: "Request body must be an array of participants" });
    }

    await db.run("BEGIN TRANSACTION");
    for (const p of list) {
      await db.run(
        `INSERT OR REPLACE INTO participants 
          (id, programId, participantCode, grade, majorGroup, applicationStatus, attendanceStatus, completionStatus, surveySubmitted, overallSatisfaction, recommendScore, note) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.programId,
          p.participantCode,
          p.grade,
          p.majorGroup,
          p.applicationStatus,
          p.attendanceStatus,
          p.completionStatus,
          p.surveySubmitted ? 1 : 0,
          p.overallSatisfaction !== undefined ? p.overallSatisfaction : null,
          p.recommendScore !== undefined ? p.recommendScore : null,
          p.note !== undefined ? p.note : null,
        ]
      );
    }
    await db.run("COMMIT");

    if (list.length > 0) {
      await syncProgramStats(list[0].programId);
    }
    res.json({ message: `Successfully saved ${list.length} participants` });
  } catch (err) {
    await db.run("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to save bulk participants" });
  }
});

// REST 8: Delete Participant
app.delete("/api/participants/:id", async (req, res) => {
  try {
    const participant = await db.get("SELECT programId FROM participants WHERE id = ?", [req.params.id]);
    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    await db.run("DELETE FROM participants WHERE id = ?", [req.params.id]);
    await syncProgramStats(participant.programId);

    res.json({ message: "Participant deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete participant" });
  }
});

// REST 9: Save Survey Summary
app.post("/api/programs/:id/survey", async (req, res) => {
  try {
    const programId = req.params.id;
    const {
      surveyTarget,
      surveyStartDate,
      surveyEndDate,
      surveyLink,
      qrCodeUrl,
      totalParticipants,
      respondents,
      responseRate,
      averageOverallSatisfaction,
      averageRecommendScore,
      averageContentScore,
      averageOperationScore,
      averageLearningOutcomeScore,
      averageAiEthicsScore,
      positiveComments,
      improvementComments,
      requestedFutureTopics,
    } = req.body;

    const existing = await db.get("SELECT programId FROM survey_summaries WHERE programId = ?", [programId]);

    const posJson = JSON.stringify(positiveComments || []);
    const impJson = JSON.stringify(improvementComments || []);
    const futJson = JSON.stringify(requestedFutureTopics || []);

    if (existing) {
      await db.run(
        `UPDATE survey_summaries SET 
          surveyTarget = ?, surveyStartDate = ?, surveyEndDate = ?, surveyLink = ?, qrCodeUrl = ?, 
          totalParticipants = ?, respondents = ?, responseRate = ?, 
          averageOverallSatisfaction = ?, averageRecommendScore = ?, averageContentScore = ?, 
          averageOperationScore = ?, averageLearningOutcomeScore = ?, averageAiEthicsScore = ?, 
          positiveComments = ?, improvementComments = ?, requestedFutureTopics = ?
         WHERE programId = ?`,
        [
          surveyTarget, surveyStartDate, surveyEndDate, surveyLink, qrCodeUrl,
          totalParticipants, respondents, responseRate,
          averageOverallSatisfaction, averageRecommendScore, averageContentScore,
          averageOperationScore, averageLearningOutcomeScore, averageAiEthicsScore,
          posJson, impJson, futJson,
          programId,
        ]
      );
    } else {
      await db.run(
        `INSERT INTO survey_summaries 
          (programId, surveyTarget, surveyStartDate, surveyEndDate, surveyLink, qrCodeUrl, totalParticipants, respondents, responseRate, averageOverallSatisfaction, averageRecommendScore, averageContentScore, averageOperationScore, averageLearningOutcomeScore, averageAiEthicsScore, positiveComments, improvementComments, requestedFutureTopics) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          programId, surveyTarget, surveyStartDate, surveyEndDate, surveyLink, qrCodeUrl,
          totalParticipants, respondents, responseRate,
          averageOverallSatisfaction, averageRecommendScore, averageContentScore,
          averageOperationScore, averageLearningOutcomeScore, averageAiEthicsScore,
          posJson, impJson, futJson,
        ]
      );
    }

    const saved = await getFullProgram(programId);
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save survey summary" });
  }
});

// REST 10: Reset DB to default mock data
app.post("/api/reset", async (req, res) => {
  try {
    await db.run("PRAGMA foreign_keys = ON");
    await db.run("DELETE FROM programs");
    await seedDefaultData();
    res.json({ message: "Database reset to CTL default mock data successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset database" });
  }
});

async function syncProgramStats(programId) {
  const survey = await db.get("SELECT * FROM survey_summaries WHERE programId = ?", [programId]);
  if (!survey) return;

  const participants = await db.all("SELECT * FROM participants WHERE programId = ?", [programId]);
  const total = participants.length;
  const respondents = participants.filter((p) => p.surveySubmitted === 1);
  const respondentsCount = respondents.length;

  let avgOverall = survey.averageOverallSatisfaction;
  let avgRecommend = survey.averageRecommendScore;

  const overallScores = respondents.filter((r) => r.overallSatisfaction !== null).map((r) => r.overallSatisfaction);
  const recommendScores = respondents.filter((r) => r.recommendScore !== null).map((r) => r.recommendScore);

  if (overallScores.length > 0) {
    const sum = overallScores.reduce((a, b) => a + b, 0);
    avgOverall = Math.round((sum / overallScores.length) * 100) / 100;
  }
  if (recommendScores.length > 0) {
    const sum = recommendScores.reduce((a, b) => a + b, 0);
    avgRecommend = Math.round((sum / recommendScores.length) * 100) / 100;
  }

  const responseRate = total > 0 ? Math.round((respondentsCount / total) * 1000) / 10 : 0;

  await db.run(
    `UPDATE survey_summaries SET 
      totalParticipants = ?, respondents = ?, responseRate = ?, 
      averageOverallSatisfaction = ?, averageRecommendScore = ?
     WHERE programId = ?`,
    [total, respondentsCount, responseRate, avgOverall, avgRecommend, programId]
  );
}

// ----------------- Production Static Hosting -----------------
if (isProd) {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start Server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[GTEC CTL-Flow Server] running on http://localhost:${PORT}`);
      console.log(`Environment: ${isProd ? "Production" : "Development"}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });
