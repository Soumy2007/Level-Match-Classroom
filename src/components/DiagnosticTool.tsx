import React, { useState, useEffect } from "react";
import {
  Classroom,
  ReadingLevel,
  MathLevel,
  READING_LEVELS,
  MATH_LEVELS,
  DiagnosticSession,
} from "../types";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Users,
  Search,
  Filter,
  Save,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  FileCheck,
} from "lucide-react";

interface DiagnosticToolProps {
  classroom: Classroom;
  onSaveDiagnostic: (
    session: DiagnosticSession,
    autoGenerateGroups: boolean
  ) => void;
  onOpenAssessmentGuide: () => void;
}

export const DiagnosticTool: React.FC<DiagnosticToolProps> = ({
  classroom,
  onSaveDiagnostic,
  onOpenAssessmentGuide,
}) => {
  const [assessmentDate, setAssessmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sessionTitle, setSessionTitle] = useState(
    `FLN Progress Check (${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
  );
  const [subjectFocus, setSubjectFocus] = useState<"both" | "reading" | "math">("both");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  // State of scores being marked: Record<studentId, { readingLevel: ReadingLevel, mathLevel: MathLevel, notes: string }>
  const [scores, setScores] = useState<
    Record<
      string,
      {
        readingLevel: ReadingLevel;
        mathLevel: MathLevel;
        notes: string;
        isModified?: boolean;
      }
    >
  >({});

  // 1-minute timer helper for paper reading checks
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Initialize scores from current student state
  useEffect(() => {
    const initial: Record<string, any> = {};
    classroom.students.forEach((s) => {
      initial[s.id] = {
        readingLevel: s.currentReadingLevel,
        mathLevel: s.currentMathLevel,
        notes: "",
        isModified: false,
      };
    });
    setScores(initial);
  }, [classroom]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const handleSetReadingLevel = (studentId: string, level: ReadingLevel) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        readingLevel: level,
        isModified: true,
      },
    }));
  };

  const handleSetMathLevel = (studentId: string, level: MathLevel) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        mathLevel: level,
        isModified: true,
      },
    }));
  };

  // Quick bulk action: promote selected or set default
  const handleBulkSetReading = (level: ReadingLevel) => {
    setScores((prev) => {
      const next = { ...prev };
      filteredStudents.forEach((s) => {
        next[s.id] = {
          ...next[s.id],
          readingLevel: level,
          isModified: true,
        };
      });
      return next;
    });
  };

  const handleBulkSetMath = (level: MathLevel) => {
    setScores((prev) => {
      const next = { ...prev };
      filteredStudents.forEach((s) => {
        next[s.id] = {
          ...next[s.id],
          mathLevel: level,
          isModified: true,
        };
      });
      return next;
    });
  };

  // Filter students
  const filteredStudents = classroom.students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.includes(searchQuery);
    if (!matchesSearch) return false;

    if (filterLevel === "all") return true;
    if (filterLevel.startsWith("r-")) {
      const lvl = filterLevel.replace("r-", "");
      return scores[s.id]?.readingLevel === lvl;
    }
    if (filterLevel.startsWith("m-")) {
      const lvl = filterLevel.replace("m-", "");
      return scores[s.id]?.mathLevel === lvl;
    }
    return true;
  });

  // Calculate changes detected
  const countChanges = Object.keys(scores).reduce((acc, studentId) => {
    const student = classroom.students.find((s) => s.id === studentId);
    if (!student) return acc;
    const s = scores[studentId];
    if (!s) return acc;
    const rChanged = s.readingLevel !== student.currentReadingLevel;
    const mChanged = s.mathLevel !== student.currentMathLevel;
    return acc + (rChanged || mChanged ? 1 : 0);
  }, 0);

  const handleSave = (autoGroup: boolean) => {
    const entries = classroom.students.map((student) => {
      const current = scores[student.id] || {
        readingLevel: student.currentReadingLevel,
        mathLevel: student.currentMathLevel,
      };
      return {
        studentId: student.id,
        readingLevel: current.readingLevel,
        mathLevel: current.mathLevel,
        notes: current.notes || undefined,
      };
    });

    const session: DiagnosticSession = {
      id: `diag-${Date.now()}`,
      classId: classroom.id,
      date: assessmentDate,
      title: sessionTitle || "FLN Diagnostic Assessment",
      subject: subjectFocus,
      summaryNote: `${countChanges} student(s) changed learning levels during this check.`,
      createdAt: new Date().toISOString(),
      entries,
    };

    onSaveDiagnostic(session, autoGroup);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                5-Minute Paper Check Flow
              </span>
              <span className="text-xs text-stone-500">
                Class: <strong className="text-stone-800">{classroom.name}</strong> ({classroom.students.length} students)
              </span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Quick Diagnostic Checklist Tool
            </h2>
            <p className="text-xs text-stone-600 max-w-2xl">
              Administer the 1-on-1 paper test with the child, then tap their demonstrated reading and math levels below.
              No manual test scoring or formula calculations required.
            </p>
          </div>

          {/* Paper Guide Button + 1-Minute Diagnostic Stopwatch */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAssessmentGuide}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl border border-stone-200 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>View Paper Test Sheet</span>
            </button>

            {/* 1-Minute Reading Timer Pill */}
            <div className="flex items-center gap-2 bg-stone-900 text-white px-3 py-1.5 rounded-xl text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-amber-300">
                {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:
                {String(timerSeconds % 60).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1 ml-1 border-l border-stone-700 pl-2">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  title={timerRunning ? "Pause Timer" : "Start 1-Min Stopwatch"}
                  className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(60);
                  }}
                  title="Reset to 60s"
                  className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Assessment Title
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Assessment Date
            </label>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Subject Filter Focus
            </label>
            <div className="flex bg-stone-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setSubjectFocus("both")}
                className={`flex-1 py-1 text-center font-medium rounded-md cursor-pointer ${
                  subjectFocus === "both" ? "bg-white text-stone-900 shadow-xs font-bold" : "text-stone-600"
                }`}
              >
                Reading & Math
              </button>
              <button
                onClick={() => setSubjectFocus("reading")}
                className={`flex-1 py-1 text-center font-medium rounded-md cursor-pointer ${
                  subjectFocus === "reading" ? "bg-white text-stone-900 shadow-xs font-bold" : "text-stone-600"
                }`}
              >
                Reading Only
              </button>
              <button
                onClick={() => setSubjectFocus("math")}
                className={`flex-1 py-1 text-center font-medium rounded-md cursor-pointer ${
                  subjectFocus === "math" ? "bg-white text-stone-900 shadow-xs font-bold" : "text-stone-600"
                }`}
              >
                Math Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search student or roll #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-stone-600">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-2 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
            >
              <option value="all">All Levels</option>
              <optgroup label="Reading Levels">
                {Object.values(READING_LEVELS).map((l) => (
                  <option key={`r-${l.id}`} value={`r-${l.id}`}>
                    Reading: {l.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Math Levels">
                {Object.values(MATH_LEVELS).map((m) => (
                  <option key={`m-${m.id}`} value={`m-${m.id}`}>
                    Math: {m.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Change summary notification & Save Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {countChanges > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{countChanges} level change{countChanges > 1 ? "s" : ""} recorded</span>
            </span>
          )}

          <button
            id="btn-save-diagnostic"
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Save assessment and automatically cluster students into learning level groups"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Save & Auto-Group</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300 transition-colors cursor-pointer"
            title="Save diagnostic records without changing current group layout"
          >
            <Save className="w-3.5 h-3.5 inline mr-1" />
            <span>Save Only</span>
          </button>
        </div>
      </div>

      {/* Student Scoring Rows */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-stone-500 border border-stone-200">
            No students found matching your search or filter criteria.
          </div>
        ) : (
          filteredStudents.map((student, idx) => {
            const studentScore = scores[student.id] || {
              readingLevel: student.currentReadingLevel,
              mathLevel: student.currentMathLevel,
              notes: "",
            };

            const rChanged = studentScore.readingLevel !== student.currentReadingLevel;
            const mChanged = studentScore.mathLevel !== student.currentMathLevel;
            const isChanged = rChanged || mChanged;

            return (
              <div
                key={student.id}
                id={`student-row-${student.id}`}
                className={`bg-white rounded-xl p-4 border transition-all ${
                  isChanged
                    ? "border-emerald-400 ring-1 ring-emerald-200 bg-emerald-50/10"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Student Identity */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-stone-200">
                      {student.rollNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">
                          {student.name}
                        </span>
                        {isChanged && (
                          <span className="px-1.5 py-0.2 text-[10px] font-extrabold uppercase bg-emerald-700 text-white rounded">
                            Updated
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2">
                        <span>
                          Baseline: R:{" "}
                          <strong className="text-stone-700">
                            {READING_LEVELS[student.baselineReadingLevel]?.code}
                          </strong>{" "}
                          | M:{" "}
                          <strong className="text-stone-700">
                            {MATH_LEVELS[student.baselineMathLevel]?.code}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Level Tap Buttons: Reading and Math */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reading Level Selector */}
                    {(subjectFocus === "both" || subjectFocus === "reading") && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                            Reading Level:
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-800">
                            {READING_LEVELS[studentScore.readingLevel]?.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                          {(["none", "letter", "word", "sentence", "paragraph", "story"] as ReadingLevel[]).map(
                            (lvl) => {
                              const info = READING_LEVELS[lvl];
                              const isSelected = studentScore.readingLevel === lvl;
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleSetReadingLevel(student.id, lvl)}
                                  title={`${info.name}: ${info.shortDesc}`}
                                  className={`py-1.5 px-1 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                                  }`}
                                >
                                  <div>{info.code}</div>
                                  <div className="text-[9px] font-normal truncate opacity-90">
                                    {info.name.split(" ")[0]}
                                  </div>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* Math Level Selector */}
                    {(subjectFocus === "both" || subjectFocus === "math") && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                            Math Level:
                          </span>
                          <span className="text-[11px] font-semibold text-blue-800">
                            {MATH_LEVELS[studentScore.mathLevel]?.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                          {(
                            [
                              "none",
                              "single-digit",
                              "two-digit-no-carry",
                              "two-digit-with-carry",
                              "multiplication-division",
                            ] as MathLevel[]
                          ).map((lvl) => {
                            const info = MATH_LEVELS[lvl];
                            const isSelected = studentScore.mathLevel === lvl;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleSetMathLevel(student.id, lvl)}
                                title={`${info.name}: ${info.shortDesc}`}
                                className={`py-1.5 px-1 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-blue-800 text-white border-blue-900 shadow-xs"
                                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                                }`}
                              >
                                <div>{info.code}</div>
                                <div className="text-[9px] font-normal truncate opacity-90">
                                  {info.name.split(" ")[0]}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Sticky Save Bar if scrolled */}
      <div className="sticky bottom-4 z-20 bg-stone-900 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between gap-4 max-w-4xl mx-auto border border-stone-800">
        <div className="flex items-center gap-2 pl-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs">
            {countChanges > 0 ? (
              <>
                <strong className="text-emerald-400">{countChanges} student(s)</strong> ready for level grouping update.
              </>
            ) : (
              "Tap any level buttons above to record current diagnostic performance."
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Save & Regroup Class</span>
          </button>
        </div>
      </div>
    </div>
  );
};
