import React from "react";
import {
  Classroom,
  READING_LEVELS,
  MATH_LEVELS,
  ReadingLevel,
  MathLevel,
  LearningGroup,
} from "../types";
import {
  Users,
  BookOpen,
  Calculator,
  TrendingUp,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Award,
} from "lucide-react";

interface DashboardViewProps {
  classroom: Classroom;
  onNavigateTab: (tab: "dashboard" | "diagnostic" | "groups" | "plans" | "reports") => void;
  onOpenAssessmentGuide: () => void;
  onOpenPlanModal: (group?: LearningGroup) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  classroom,
  onNavigateTab,
  onOpenAssessmentGuide,
  onOpenPlanModal,
}) => {
  const totalStudents = classroom.students.length;

  // Reading Level distribution
  const readingLevelsOrder: ReadingLevel[] = [
    "story",
    "paragraph",
    "sentence",
    "word",
    "letter",
    "none",
  ];

  const mathLevelsOrder: MathLevel[] = [
    "multiplication-division",
    "two-digit-with-carry",
    "two-digit-no-carry",
    "single-digit",
    "none",
  ];

  const fluentReaders = classroom.students.filter(
    (s) => s.currentReadingLevel === "story"
  ).length;

  const nonReaders = classroom.students.filter(
    (s) => s.currentReadingLevel === "none" || s.currentReadingLevel === "letter"
  ).length;

  const advancedMathCount = classroom.students.filter(
    (s) =>
      s.currentMathLevel === "multiplication-division" ||
      s.currentMathLevel === "two-digit-with-carry"
  ).length;

  const beginnerMathCount = classroom.students.filter(
    (s) => s.currentMathLevel === "none" || s.currentMathLevel === "single-digit"
  ).length;

  // Students who progressed
  const studentsAdvancedReading = classroom.students.filter((s) => {
    const baseRank = READING_LEVELS[s.baselineReadingLevel]?.numericRank || 0;
    const currRank = READING_LEVELS[s.currentReadingLevel]?.numericRank || 0;
    return currRank > baseRank;
  }).length;

  const latestDiagnostic = classroom.diagnostics[classroom.diagnostics.length - 1];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Classroom Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Active Classroom
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {classroom.schoolName}
              </span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {classroom.name}
            </h1>
            <p className="text-xs text-stone-600 max-w-2xl">
              Teacher: <strong>{classroom.teacherName}</strong> | Grade:{" "}
              <strong>{classroom.grade}</strong> | Section:{" "}
              <strong>{classroom.section}</strong> | Enrolled:{" "}
              <strong>{totalStudents} Children</strong>
            </p>
          </div>

          {/* Key Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-quick-diagnostic"
              onClick={() => onNavigateTab("diagnostic")}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Start 5-Min Diagnostic</span>
            </button>

            <button
              onClick={() => onOpenPlanModal()}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Generate Blackboard Plan</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-stone-100">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
              <span>Total Roster</span>
              <Users className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-black text-stone-900 mt-1">
              {totalStudents}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              100% baseline assessed
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
              <span>Reading Improvement</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-1">
              {studentsAdvancedReading}
              <span className="text-sm font-semibold text-emerald-700 ml-1">
                ({Math.round((studentsAdvancedReading / totalStudents) * 100)}%)
              </span>
            </div>
            <div className="text-[11px] text-emerald-800 mt-0.5">
              Moved up ≥1 reading level
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center justify-between text-blue-800 text-xs font-bold">
              <span>Active Groups</span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-950 mt-1">
              {classroom.groups.length}
            </div>
            <div className="text-[11px] text-blue-800 mt-0.5">
              Clustered by skill level
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200">
            <div className="flex items-center justify-between text-purple-800 text-xs font-bold">
              <span>Blackboard Plans</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-950 mt-1">
              {classroom.activityPlans.length}
            </div>
            <div className="text-[11px] text-purple-800 mt-0.5">
              Zero-cost chalk curricula
            </div>
          </div>
        </div>
      </div>

      {/* Foundational Skill Distribution Bars (Reading & Math) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Reading Distribution Card */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Reading Skill Distribution
                </h3>
                <p className="text-[11px] text-stone-500">
                  Current mastery level across all {totalStudents} children
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab("groups")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <span>View Groups</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented Visual Progress Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-lg overflow-hidden flex bg-stone-100 border border-stone-200">
              {readingLevelsOrder.map((lvl) => {
                const count = classroom.students.filter(
                  (s) => s.currentReadingLevel === lvl
                ).length;
                const pct = (count / totalStudents) * 100;
                if (pct === 0) return null;

                const bgClass =
                  lvl === "story"
                    ? "bg-emerald-600"
                    : lvl === "paragraph"
                    ? "bg-teal-600"
                    : lvl === "sentence"
                    ? "bg-sky-600"
                    : lvl === "word"
                    ? "bg-amber-500"
                    : lvl === "letter"
                    ? "bg-orange-500"
                    : "bg-rose-500";

                return (
                  <div
                    key={lvl}
                    title={`${READING_LEVELS[lvl].name}: ${count} (${Math.round(pct)}%)`}
                    style={{ width: `${pct}%` }}
                    className={`${bgClass} transition-all duration-300 relative group`}
                  />
                );
              })}
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-1.5 pt-1">
              {readingLevelsOrder.map((lvl) => {
                const count = classroom.students.filter(
                  (s) => s.currentReadingLevel === lvl
                ).length;
                const pct = Math.round((count / totalStudents) * 100);
                const info = READING_LEVELS[lvl];

                return (
                  <div
                    key={lvl}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-stone-50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          lvl === "story"
                            ? "bg-emerald-600"
                            : lvl === "paragraph"
                            ? "bg-teal-600"
                            : lvl === "sentence"
                            ? "bg-sky-600"
                            : lvl === "word"
                            ? "bg-amber-500"
                            : lvl === "letter"
                            ? "bg-orange-500"
                            : "bg-rose-500"
                        }`}
                      />
                      <span className="font-semibold text-stone-800">
                        {info.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-stone-500 text-[11px] font-mono">
                        {count} children
                      </span>
                      <span className="font-bold text-stone-800 font-mono w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Math Distribution Card */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Math Skill Distribution
                </h3>
                <p className="text-[11px] text-stone-500">
                  Current foundational numeracy across all {totalStudents} children
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab("groups")}
              className="text-xs font-bold text-blue-800 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
            >
              <span>View Groups</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented Visual Progress Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-lg overflow-hidden flex bg-stone-100 border border-stone-200">
              {mathLevelsOrder.map((lvl) => {
                const count = classroom.students.filter(
                  (s) => s.currentMathLevel === lvl
                ).length;
                const pct = (count / totalStudents) * 100;
                if (pct === 0) return null;

                const bgClass =
                  lvl === "multiplication-division"
                    ? "bg-emerald-600"
                    : lvl === "two-digit-with-carry"
                    ? "bg-indigo-600"
                    : lvl === "two-digit-no-carry"
                    ? "bg-blue-600"
                    : lvl === "single-digit"
                    ? "bg-amber-500"
                    : "bg-rose-500";

                return (
                  <div
                    key={lvl}
                    title={`${MATH_LEVELS[lvl].name}: ${count} (${Math.round(pct)}%)`}
                    style={{ width: `${pct}%` }}
                    className={`${bgClass} transition-all duration-300 relative group`}
                  />
                );
              })}
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-1.5 pt-1">
              {mathLevelsOrder.map((lvl) => {
                const count = classroom.students.filter(
                  (s) => s.currentMathLevel === lvl
                ).length;
                const pct = Math.round((count / totalStudents) * 100);
                const info = MATH_LEVELS[lvl];

                return (
                  <div
                    key={lvl}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-stone-50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          lvl === "multiplication-division"
                            ? "bg-emerald-600"
                            : lvl === "two-digit-with-carry"
                            ? "bg-indigo-600"
                            : lvl === "two-digit-no-carry"
                            ? "bg-blue-600"
                            : lvl === "single-digit"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                      />
                      <span className="font-semibold text-stone-800">
                        {info.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-stone-500 text-[11px] font-mono">
                        {count} children
                      </span>
                      <span className="font-bold text-stone-800 font-mono w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Groups Quick Grid */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">
              Current Learning Groups &amp; Peer Mentors
            </h3>
            <p className="text-[11px] text-stone-500">
              Students practice with peers at their exact competency level
            </p>
          </div>

          <button
            onClick={() => onNavigateTab("groups")}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Groups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classroom.groups.slice(0, 6).map((group) => {
            const hasPlan = classroom.activityPlans.some(
              (p) => p.groupId === group.id
            );

            return (
              <div
                key={group.id}
                className="p-3.5 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors bg-stone-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-stone-800 truncate">
                      {group.name}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500 bg-white px-2 py-0.2 rounded-full border border-stone-200">
                      {group.studentIds.length} stds
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 capitalize">
                    {group.subject} • Level: {group.level}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-stone-500">
                    {group.peerMentors?.length ? (
                      <span className="text-purple-700 font-bold">
                        ★ {group.peerMentors.length} Mentor(s)
                      </span>
                    ) : (
                      "No mentor"
                    )}
                  </span>

                  {hasPlan ? (
                    <button
                      onClick={() => onNavigateTab("plans")}
                      className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      View Plan →
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenPlanModal(group)}
                      className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
                    >
                      + Gen Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Diagnostic Check History banner */}
      {latestDiagnostic && (
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-stone-500 shrink-0" />
            <div>
              <span className="font-bold text-stone-800">
                Latest Diagnostic Check:
              </span>{" "}
              <span className="text-stone-600">{latestDiagnostic.title}</span> (
              <span className="font-mono text-stone-500">
                {latestDiagnostic.date}
              </span>
              )
              <p className="text-[11px] text-stone-500 mt-0.5">
                {latestDiagnostic.summaryNote}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("reports")}
            className="text-xs font-bold text-emerald-800 hover:underline shrink-0 cursor-pointer"
          >
            Open Full Progress Report →
          </button>
        </div>
      )}
    </div>
  );
};
