import React, { useState } from "react";
import {
  ActivityPlan,
  Classroom,
  LearningGroup,
  READING_LEVELS,
  MATH_LEVELS,
} from "../types";
import {
  Sparkles,
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Palette,
  Eye,
  CheckSquare,
  Square,
  RotateCcw,
} from "lucide-react";

interface ActivityPlanViewProps {
  classroom: Classroom;
  plans: ActivityPlan[];
  selectedPlanId?: string;
  onSelectPlan: (id: string) => void;
  onToggleDayCompleted: (planId: string, weekNum: number, dayNum: number) => void;
  onOpenGenerateModal: (group?: LearningGroup) => void;
}

export const ActivityPlanView: React.FC<ActivityPlanViewProps> = ({
  classroom,
  plans,
  selectedPlanId,
  onSelectPlan,
  onToggleDayCompleted,
  onOpenGenerateModal,
}) => {
  const [activeTabDay, setActiveTabDay] = useState<number>(1);
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [blackboardTheme, setBlackboardTheme] = useState<boolean>(false);

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  if (!currentPlan) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-4 max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">
          No Blackboard Activity Plans Generated Yet
        </h3>
        <p className="text-xs text-stone-600">
          LevelMatch uses AI to craft zero-cost, 1-to-2 week blackboard and oral lesson plans tailored to each group&apos;s foundational level.
        </p>
        <button
          onClick={() => onOpenGenerateModal()}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Generate Plan with Gemini AI</span>
        </button>
      </div>
    );
  }

  const isReading = currentPlan.subject === "reading";
  const levelMeta: any = isReading
    ? READING_LEVELS[currentPlan.level as any]
    : MATH_LEVELS[currentPlan.level as any];

  const currentWeekData =
    currentPlan.plan.weeks.find((w) => w.weekNumber === activeWeek) ||
    currentPlan.plan.weeks[0];

  const currentDayData =
    currentWeekData?.days.find((d) => d.dayNumber === activeTabDay) ||
    currentWeekData?.days[0];

  // Calculate completion percentage
  const totalDays = currentPlan.durationWeeks * 5;
  const completedCount = Object.values(currentPlan.completedDays || {}).filter(
    Boolean
  ).length;
  const percentComplete = Math.round((completedCount / totalDays) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controller Bar */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900">
                AI Blackboard Curriculum
              </span>
              <span className="text-xs text-stone-500">
                Source: <strong>{currentPlan.source}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>{currentPlan.plan.title}</span>
            </h2>
            <p className="text-xs text-stone-600 max-w-2xl">
              {currentPlan.plan.summary}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Blackboard Chalkboard view switch */}
            <button
              onClick={() => setBlackboardTheme(!blackboardTheme)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                blackboardTheme
                  ? "bg-stone-900 text-amber-300 border-stone-800"
                  : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
              }`}
              title="Switch to chalkboard high-contrast simulation for drawing onto class board"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{blackboardTheme ? "Chalkboard View (On)" : "Chalkboard View"}</span>
            </button>

            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl border border-stone-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span>Print Card</span>
            </button>

            {/* Generate Another Plan */}
            <button
              onClick={() => onOpenGenerateModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>New Plan</span>
            </button>
          </div>
        </div>

        {/* Plan Selector if multiple plans exist */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Select Plan:</span>
            <div className="flex flex-wrap gap-1.5">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPlan(p.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    p.id === currentPlan.id
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                  }`}
                >
                  {p.groupName} ({p.durationWeeks}W)
                </button>
              ))}
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-stone-500">
              Completed: <strong>{completedCount}/{totalDays} Days</strong>
            </span>
            <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="font-bold text-emerald-800">{percentComplete}%</span>
          </div>
        </div>
      </div>

      {/* Main Lesson Plan Card Container (styled with optional Blackboard theme) */}
      <div
        className={`rounded-2xl border transition-all overflow-hidden ${
          blackboardTheme
            ? "bg-[#1f2824] border-[#2e3e37] text-stone-100 shadow-xl"
            : "bg-white border-stone-200 text-stone-900 shadow-xs"
        }`}
      >
        {/* Card Header with Week Selector */}
        <div
          className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            blackboardTheme
              ? "border-[#2e3e37] bg-[#17201c]"
              : "border-stone-100 bg-stone-50/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                levelMeta?.textBadgeClass || "bg-emerald-100 text-emerald-800"
              }`}
            >
              {levelMeta?.name || currentPlan.level}
            </span>
            <span className="text-xs font-semibold opacity-75">
              Target Group: <strong>{currentPlan.groupName}</strong>
            </span>
          </div>

          {/* Week selector */}
          {currentPlan.plan.weeks.length > 1 && (
            <div className="flex items-center gap-1 text-xs">
              <span className="opacity-75 mr-1 font-medium">Week:</span>
              {currentPlan.plan.weeks.map((w) => (
                <button
                  key={w.weekNumber}
                  onClick={() => {
                    setActiveWeek(w.weekNumber);
                    setActiveTabDay(1);
                  }}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                    activeWeek === w.weekNumber
                      ? blackboardTheme
                        ? "bg-amber-400 text-stone-950"
                        : "bg-emerald-800 text-white"
                      : blackboardTheme
                      ? "bg-[#25332c] text-stone-300 hover:bg-[#32453b]"
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                  }`}
                >
                  Week {w.weekNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Week Focus summary */}
        {currentWeekData && (
          <div
            className={`px-5 py-2.5 text-xs font-medium border-b flex items-center gap-2 ${
              blackboardTheme
                ? "bg-[#141b18] border-[#2e3e37] text-amber-200/90"
                : "bg-stone-100/70 border-stone-100 text-stone-700"
            }`}
          >
            <span className="font-bold uppercase tracking-wider text-[10px] opacity-80">
              Week {currentWeekData.weekNumber} Focus:
            </span>
            <span>{currentWeekData.focus}</span>
          </div>
        )}

        {/* 5-Day Navigation Tabs */}
        <div
          className={`flex border-b overflow-x-auto ${
            blackboardTheme ? "border-[#2e3e37] bg-[#19221e]" : "border-stone-100 bg-stone-50"
          }`}
        >
          {currentWeekData?.days.map((day) => {
            const isCompleted =
              !!currentPlan.completedDays?.[`w${activeWeek}-d${day.dayNumber}`];
            const isActive = activeTabDay === day.dayNumber;

            return (
              <button
                key={day.dayNumber}
                onClick={() => setActiveTabDay(day.dayNumber)}
                className={`flex-1 min-w-[100px] py-3 px-3 text-center border-b-2 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isActive
                    ? blackboardTheme
                      ? "border-amber-400 text-amber-300 bg-[#25332c]"
                      : "border-emerald-800 text-emerald-900 bg-white shadow-xs"
                    : blackboardTheme
                    ? "border-transparent text-stone-400 hover:text-stone-200"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <span>Day {day.dayNumber}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Content */}
        {currentDayData && (
          <div className="p-5 sm:p-6 space-y-6">
            {/* Day Header & Done Checkbox */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dashed border-stone-200 dark:border-stone-700">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                  Day {currentDayData.dayNumber} Objective
                </span>
                <h3 className="text-base sm:text-lg font-bold mt-0.5">
                  {currentDayData.objective}
                </h3>
              </div>

              {/* Mark day complete toggle */}
              <button
                onClick={() =>
                  onToggleDayCompleted(currentPlan.id, activeWeek, currentDayData.dayNumber)
                }
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer self-start sm:self-center ${
                  currentPlan.completedDays?.[`w${activeWeek}-d${currentDayData.dayNumber}`]
                    ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                    : blackboardTheme
                    ? "bg-[#25332c] text-stone-300 border-[#32453b] hover:border-amber-400"
                    : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                }`}
              >
                {currentPlan.completedDays?.[`w${activeWeek}-d${currentDayData.dayNumber}`] ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-emerald-200" />
                    <span>Session Completed!</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 opacity-60" />
                    <span>Mark Day Completed</span>
                  </>
                )}
              </button>
            </div>

            {/* Blackboard Chalk Box (Prominent display for chalk setup) */}
            <div
              className={`rounded-xl p-4 border relative overflow-hidden ${
                blackboardTheme
                  ? "bg-[#111714] border-stone-700 text-stone-100 font-mono"
                  : "bg-stone-900 border-stone-800 text-stone-100 font-mono"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 border-b border-stone-800 pb-1.5 font-sans">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Chalkboard Setup (Write on Board Before Session)</span>
                </span>
                <span className="text-stone-400 font-mono text-[10px]">Zero-Print Setup</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-amber-100/90 whitespace-pre-line">
                {currentDayData.blackboardSetup}
              </p>
            </div>

            {/* Step-by-Step Activities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">
                Core Classroom Activities (35–40 Minutes)
              </h4>
              <div className="space-y-2.5">
                {currentDayData.activities.map((act) => (
                  <div
                    key={act.step}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                      blackboardTheme
                        ? "bg-[#25332c]/50 border-[#2e3e37]"
                        : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        blackboardTheme
                          ? "bg-amber-400 text-stone-950"
                          : "bg-emerald-800 text-white"
                      }`}
                    >
                      {act.step}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm">
                          {act.title}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold opacity-75">
                          <Clock className="w-3 h-3" />
                          <span>{act.durationMinutes} mins</span>
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">
                        {act.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Oral Game & Teacher Tips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Active Oral Game */}
              <div
                className={`p-4 rounded-xl border ${
                  blackboardTheme
                    ? "bg-[#212b26] border-[#2e3e37]"
                    : "bg-amber-50/70 border-amber-200 text-amber-950"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300 mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Energizing Oral Game / TPR</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {currentDayData.oralGame}
                </p>
              </div>

              {/* Master Teacher Tip & Materials */}
              <div
                className={`p-4 rounded-xl border ${
                  blackboardTheme
                    ? "bg-[#212b26] border-[#2e3e37]"
                    : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Master Teacher Tip</span>
                </div>
                <p className="text-xs leading-relaxed mb-2">
                  {currentDayData.teacherTips}
                </p>
                <div className="text-[11px] opacity-80 pt-1 border-t border-emerald-200/50 dark:border-stone-700">
                  <strong>Materials:</strong>{" "}
                  {currentDayData.materials.join(", ")}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
