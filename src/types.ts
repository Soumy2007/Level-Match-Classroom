export type ReadingLevel = "none" | "letter" | "word" | "sentence" | "paragraph" | "story";

export type MathLevel =
  | "none"
  | "single-digit"
  | "two-digit-no-carry"
  | "two-digit-with-carry"
  | "multiplication-division";

export interface LevelInfo<T extends string> {
  id: T;
  code: string;
  name: string;
  shortDesc: string;
  criteria: string;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
  textBadgeClass: string;
  numericRank: number;
}

export const READING_LEVELS: Record<ReadingLevel, LevelInfo<ReadingLevel>> = {
  none: {
    id: "none",
    code: "NR",
    name: "Non-Reader",
    shortDesc: "Cannot recognize basic letters or phonemic sounds",
    criteria: "Unable to identify at least 4 out of 5 letters correctly",
    colorClass: "bg-rose-500 text-white",
    bgLightClass: "bg-rose-50 text-rose-800",
    borderClass: "border-rose-200",
    textBadgeClass: "bg-rose-100 text-rose-700",
    numericRank: 0,
  },
  letter: {
    id: "letter",
    code: "LT",
    name: "Letter Level",
    shortDesc: "Can recognize and sound out individual letters",
    criteria: "Can identify 4 out of 5 letters but cannot read simple words",
    colorClass: "bg-amber-500 text-white",
    bgLightClass: "bg-amber-50 text-amber-800",
    borderClass: "border-amber-200",
    textBadgeClass: "bg-amber-100 text-amber-700",
    numericRank: 1,
  },
  word: {
    id: "word",
    code: "WD",
    name: "Word Level",
    shortDesc: "Can blend sounds to read simple 2-3 letter words",
    criteria: "Can read 4 out of 5 simple words (CVC / common nouns)",
    colorClass: "bg-amber-600 text-white",
    bgLightClass: "bg-yellow-50 text-amber-900",
    borderClass: "border-yellow-200",
    textBadgeClass: "bg-yellow-100 text-amber-800",
    numericRank: 2,
  },
  sentence: {
    id: "sentence",
    code: "SN",
    name: "Sentence Level",
    shortDesc: "Reads short 3-5 word sentences with emergent phrasing",
    criteria: "Can read simple sentences with minor hesitation",
    colorClass: "bg-sky-500 text-white",
    bgLightClass: "bg-sky-50 text-sky-800",
    borderClass: "border-sky-200",
    textBadgeClass: "bg-sky-100 text-sky-700",
    numericRank: 3,
  },
  paragraph: {
    id: "paragraph",
    code: "PG",
    name: "Paragraph Level",
    shortDesc: "Reads a simple 4-line connected paragraph with basic stops",
    criteria: "Reads a 4-line paragraph with 2 or fewer errors",
    colorClass: "bg-teal-600 text-white",
    bgLightClass: "bg-teal-50 text-teal-800",
    borderClass: "border-teal-200",
    textBadgeClass: "bg-teal-100 text-teal-700",
    numericRank: 4,
  },
  story: {
    id: "story",
    code: "ST",
    name: "Story Level (Fluent)",
    shortDesc: "Reads Grade 2 story text fluently with full comprehension",
    criteria: "Reads 7-10 line story at 60+ wpm and answers comprehension questions",
    colorClass: "bg-emerald-600 text-white",
    bgLightClass: "bg-emerald-50 text-emerald-800",
    borderClass: "border-emerald-200",
    textBadgeClass: "bg-emerald-100 text-emerald-700",
    numericRank: 5,
  },
};

export const MATH_LEVELS: Record<MathLevel, LevelInfo<MathLevel>> = {
  none: {
    id: "none",
    code: "BN",
    name: "Beginner (No Count)",
    shortDesc: "No 1-to-1 correspondence or number recognition",
    criteria: "Unable to count 5 objects or recognize digits 1-9",
    colorClass: "bg-rose-500 text-white",
    bgLightClass: "bg-rose-50 text-rose-800",
    borderClass: "border-rose-200",
    textBadgeClass: "bg-rose-100 text-rose-700",
    numericRank: 0,
  },
  "single-digit": {
    id: "single-digit",
    code: "1D",
    name: "1-Digit Numbers (1–9)",
    shortDesc: "Recognizes 1–9 and solves single-digit addition",
    criteria: "Can identify numbers 1 to 9 and count physical objects",
    colorClass: "bg-amber-500 text-white",
    bgLightClass: "bg-amber-50 text-amber-800",
    borderClass: "border-amber-200",
    textBadgeClass: "bg-amber-100 text-amber-700",
    numericRank: 1,
  },
  "two-digit-no-carry": {
    id: "two-digit-no-carry",
    code: "2D",
    name: "2-Digit (No Regrouping)",
    shortDesc: "Recognizes 10–99; column math without carry or borrow",
    criteria: "Solves 2-digit addition and subtraction without carrying/borrowing",
    colorClass: "bg-blue-500 text-white",
    bgLightClass: "bg-blue-50 text-blue-800",
    borderClass: "border-blue-200",
    textBadgeClass: "bg-blue-100 text-blue-700",
    numericRank: 2,
  },
  "two-digit-with-carry": {
    id: "two-digit-with-carry",
    code: "RC",
    name: "2-Digit with Regrouping",
    shortDesc: "Masters carrying in addition and borrowing in subtraction",
    criteria: "Correctly solves 2-digit subtraction with borrowing",
    colorClass: "bg-indigo-600 text-white",
    bgLightClass: "bg-indigo-50 text-indigo-800",
    borderClass: "border-indigo-200",
    textBadgeClass: "bg-indigo-100 text-indigo-700",
    numericRank: 3,
  },
  "multiplication-division": {
    id: "multiplication-division",
    code: "MD",
    name: "Multiplication & Division",
    shortDesc: "Understands equal groups, times tables, and fair sharing",
    criteria: "Can solve 3-digit by 1-digit division with remainder",
    colorClass: "bg-emerald-600 text-white",
    bgLightClass: "bg-emerald-50 text-emerald-800",
    borderClass: "border-emerald-200",
    textBadgeClass: "bg-emerald-100 text-emerald-700",
    numericRank: 4,
  },
};

export interface DiagnosticAssessmentHistory {
  date: string;
  readingLevel: ReadingLevel;
  mathLevel: MathLevel;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  gender: "female" | "male";
  currentReadingLevel: ReadingLevel;
  currentMathLevel: MathLevel;
  baselineReadingLevel: ReadingLevel;
  baselineMathLevel: MathLevel;
  lastAssessedDate: string;
  history: DiagnosticAssessmentHistory[];
}

export interface DiagnosticEntry {
  studentId: string;
  readingLevel: ReadingLevel;
  mathLevel: MathLevel;
  notes?: string;
}

export interface DiagnosticSession {
  id: string;
  classId: string;
  date: string;
  title: string;
  subject: "both" | "reading" | "math";
  entries: DiagnosticEntry[];
  summaryNote?: string;
  createdAt: string;
}

export interface LearningGroup {
  id: string;
  classId: string;
  subject: "reading" | "math";
  level: string; // ReadingLevel or MathLevel
  name: string;
  studentIds: string[];
  peerMentors?: string[];
  activityPlanId?: string;
  createdAt?: string;
}

export interface ActivityDay {
  dayNumber: number;
  objective: string;
  blackboardSetup: string;
  activities: {
    step: number;
    title: string;
    description: string;
    durationMinutes: number;
  }[];
  materials: string[];
  oralGame: string;
  teacherTips: string;
}

export interface ActivityWeek {
  weekNumber: number;
  focus: string;
  days: ActivityDay[];
}

export interface ActivityPlan {
  id: string;
  classId: string;
  groupId: string;
  groupName: string;
  subject: "reading" | "math";
  level: string;
  durationWeeks: number;
  createdAt: string;
  source: string;
  completedDays: Record<string, boolean>; // e.g. "w1-d1": true
  plan: {
    title: string;
    summary: string;
    subject: string;
    level: string;
    durationWeeks: number;
    weeks: ActivityWeek[];
  };
}

export interface Classroom {
  id: string;
  name: string;
  grade: string;
  section: string;
  schoolName: string;
  teacherName: string;
  academicYear: string;
  students: Student[];
  diagnostics: DiagnosticSession[];
  groups: LearningGroup[];
  activityPlans: ActivityPlan[];
}

export interface SyncQueueItem {
  id: string;
  type:
    | "diagnostic"
    | "diagnostic_saved"
    | "group_update"
    | "groups_updated"
    | "plan_generated"
    | "plan_tick"
    | "student_add"
    | "class_created";
  timestamp: string;
  payload: any;
}
