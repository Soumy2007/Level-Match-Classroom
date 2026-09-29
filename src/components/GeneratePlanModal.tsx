import React, { useState } from "react";
import {
  LearningGroup,
  Classroom,
  READING_LEVELS,
  MATH_LEVELS,
  ReadingLevel,
  MathLevel,
} from "../types";
import { Sparkles, X, Layers, Clock, BookOpen, Calculator, Loader2 } from "lucide-react";
import { requestActivityPlan } from "../services/api";

interface GeneratePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom;
  targetGroup?: LearningGroup;
  onPlanGenerated: (newPlan: any, targetGroupId: string) => void;
}

export const GeneratePlanModal: React.FC<GeneratePlanModalProps> = ({
  isOpen,
  onClose,
  classroom,
  targetGroup,
  onPlanGenerated,
}) => {
  const [subject, setSubject] = useState<"reading" | "math">(
    targetGroup?.subject || "reading"
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    targetGroup?.id || classroom.groups[0]?.id || ""
  );
  const [durationWeeks, setDurationWeeks] = useState<1 | 2>(1);
  const [language, setLanguage] = useState("English & Local Dialect");
  const [context, setContext] = useState(
    "Low-resource primary school, single chalkboard, slates, stones & pebbles, multi-grade seating"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const relevantGroups = classroom.groups.filter((g) => g.subject === subject);
  const currentGroup = classroom.groups.find((g) => g.id === selectedGroupId) || relevantGroups[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const levelToUse = currentGroup ? currentGroup.level : "word";

    try {
      const result = await requestActivityPlan({
        groupLevel: levelToUse,
        subject,
        durationWeeks,
        className: classroom.name,
        studentCount: currentGroup ? currentGroup.studentIds.length : 12,
        language,
        context,
      });

      const newPlanId = `plan-${Date.now()}`;
      const activityPlanObj = {
        id: newPlanId,
        classId: classroom.id,
        groupId: currentGroup ? currentGroup.id : `grp-custom-${Date.now()}`,
        groupName: currentGroup ? currentGroup.name : `${subject} ${levelToUse.toUpperCase()} Group`,
        subject,
        level: levelToUse,
        durationWeeks,
        createdAt: new Date().toISOString(),
        source: result.source,
        completedDays: {},
        plan: result.plan,
      };

      onPlanGenerated(activityPlanObj, currentGroup?.id || "");
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate activity plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Generate Blackboard Lesson Plan
              </h3>
              <p className="text-xs text-stone-500">
                Powered by Gemini AI with low-resource TaRL pedagogy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-5 overflow-y-auto space-y-4 text-sm">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Subject Toggle */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Select Subject
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubject("reading");
                  const firstR = classroom.groups.find((g) => g.subject === "reading");
                  if (firstR) setSelectedGroupId(firstR.id);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  subject === "reading"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-500 shadow-xs"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Reading (Literacy)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubject("math");
                  const firstM = classroom.groups.find((g) => g.subject === "math");
                  if (firstM) setSelectedGroupId(firstM.id);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  subject === "math"
                    ? "bg-blue-50 text-blue-900 border-blue-500 shadow-xs"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <Calculator className="w-4 h-4 text-blue-700" />
                <span>Math (Numeracy)</span>
              </button>
            </div>
          </div>

          {/* Target Group Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Target Learning Group
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {relevantGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.studentIds.length} students - Level: {g.level})
                </option>
              ))}
            </select>
          </div>

          {/* Duration Horizon */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Time Horizon
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDurationWeeks(1)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                  durationWeeks === 1
                    ? "bg-purple-50 text-purple-900 border-purple-500 shadow-xs"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <div>1 Week Plan</div>
                <div className="text-[10px] font-normal text-stone-500">5 daily blackboard sessions</div>
              </button>

              <button
                type="button"
                onClick={() => setDurationWeeks(2)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                  durationWeeks === 2
                    ? "bg-purple-50 text-purple-900 border-purple-500 shadow-xs"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <div>2 Weeks Plan</div>
                <div className="text-[10px] font-normal text-stone-500">10 progressive sessions</div>
              </button>
            </div>
          </div>

          {/* Language & Context */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Medium / Dialect
            </label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Physical Constraints & Resources
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Guarantees zero printed worksheets; assumes single blackboard, chalk, student notebooks/slates.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2 -mx-5 -mb-5 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                  <span>Generate Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
