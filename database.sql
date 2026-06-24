-- GTEC CTL-Flow Database Schema (SQLite)

-- 1. Programs Table
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

-- 2. Survey Summaries Table
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
  positiveComments TEXT NOT NULL,      -- JSON-serialized array of strings
  improvementComments TEXT NOT NULL,   -- JSON-serialized array of strings
  requestedFutureTopics TEXT NOT NULL, -- JSON-serialized array of strings
  FOREIGN KEY (programId) REFERENCES programs (id) ON DELETE CASCADE
);

-- 3. Participants Table
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  programId TEXT NOT NULL,
  participantCode TEXT NOT NULL,
  grade TEXT NOT NULL,
  majorGroup TEXT NOT NULL,
  applicationStatus TEXT NOT NULL,
  attendanceStatus TEXT NOT NULL,
  completionStatus TEXT NOT NULL,
  surveySubmitted INTEGER NOT NULL DEFAULT 0, -- 0 for false, 1 for true
  overallSatisfaction INTEGER,
  recommendScore INTEGER,
  note TEXT,
  FOREIGN KEY (programId) REFERENCES programs (id) ON DELETE CASCADE,
  UNIQUE(programId, participantCode) -- Protect against duplicate codes in the same program
);
