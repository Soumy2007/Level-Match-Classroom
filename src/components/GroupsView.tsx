import React, { useState } from "react";
import {
  Classroom,
  LearningGroup,
  Student,
  READING_LEVELS,
  MATH_LEVELS,
} from "../types";
import {
  Users,
  BookOpen,
  Calculator,
  Sparkles,
  ArrowRightLeft,
  UserCheck,
  Plus,
  RefreshCw,
  FileText,
  ChevronRight,
  UserPlus,
} from "lucide-react";

interface GroupsViewProps {
  classroom: Classroom;
  onUpdateGroupStudents: (groupId: string, newStudentIds: string[]) => void;
  onAutoRegroup: (subject: "reading" | "math" | "both") => void;
  onOpenPlanGenerator: (group: LearningGroup) => void;
  onViewPlan: (planId: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  classroom,
  onUpdateGroupStudents,
  onAutoRegroup,
  onOpenPlanGenerator,
  onViewPlan,
}) => {
  const [activeSubject, setActiveSubject] = useState<"reading" | "math">("reading");
  const [movingStudent, setMovingStudent] = useState<Student | null>(null);
  const [sourceGroupId, setSourceGroupId] = useState<string | null>(null);

  const groups = classroom.groups.filter((g) => g.subject === activeSubject);

  const getStudent = (id: string) => classroom.students.find((s) => s.id === id);

  // Move student to destination group
  const handleMoveStudentTo = (targetGroupId: string) => {
    if (!movingStudent || !sourceGroupId) return;
    if (sourceGroupId === targetGroupId) {
      setMovingStudent(null);
      setSourceGroupId(null);
      return;
    }

    // Remove from source group
    const sourceGroup = classroom.groups.find((g) => g.id === sourceGroupId);
    if (sourceGroup) {
      const updatedSource = sourceGroup.studentIds.filter(
        (id) => id !== movingStudent.id
      );
      onUpdateGroupStudents(sourceGroupId, updatedSource);
    }

    // Add to target group
    const targetGroup = classroom.groups.find((g) => g.id === targetGroupId);
    if (targetGroup) {
      const updatedTarget = [...targetGroup.studentIds, movingStudent.id];
      onUpdateGroupStudents(targetGroupId, updatedTarget);
    }

    setMovingStudent(null);
    setSourceGroupId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Automated Level Clustering
              </span>
              <span className="text-xs text-stone-500">
                Classroom: <strong>{classroom.name}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Foundational Learning Level Groups
            </h2>
            <p className="text-xs text-stone-600 max-w-2xl">
              Students are clustered by actual demonstrated level rather than age or grade syllabus.
              Reassign students flexibly using the move button, or click &ldquo;Regroup from Latest Diagnostic&rdquo; to reset.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-auto-regroup"
              onClick={() => onAutoRegroup(activeSubject)}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl border border-stone-200 transition-colors cursor-pointer"
              title="Automatically cluster all students into groups based on their latest diagnostic score"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
              <span>Regroup from Diagnostics</span>
            </button>
          </div>
        </div>

        {/* Subject Switcher Tabs */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveSubject("reading")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubject === "reading"
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>
                Reading Groups (
                {classroom.groups.filter((g) => g.subject === "reading").length})
              </span>
            </button>

            <button
              onClick={() => setActiveSubject("math")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubject === "math"
                  ? "bg-white text-blue-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Calculator className="w-4 h-4 text-blue-700" />
              <span>
                Math Groups (
                {classroom.groups.filter((g) => g.subject === "math").length})
              </span>
            </button>
          </div>

          {movingStudent && (
            <div className="bg-amber-100 text-amber-950 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-amber-300">
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>
                Moving <strong>{movingStudent.name}</strong>: Click &ldquo;Move Here&rdquo; on any group card.
              </span>
              <button
                onClick={() => {
                  setMovingStudent(null);
                  setSourceGroupId(null);
                }}
                className="underline font-bold text-amber-900 hover:text-black ml-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Group Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-stone-200 space-y-3">
            <Users className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="font-bold text-stone-800">No Groups Formed Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Run a quick diagnostic or click the button below to automatically generate level groups for this class.
            </p>
            <button
              onClick={() => onAutoRegroup(activeSubject)}
              className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Generate Groups Now
            </button>
          </div>
        ) : (
          groups.map((group) => {
            const isReading = group.subject === "reading";
            const levelMeta: any = isReading
              ? READING_LEVELS[group.level as any]
              : MATH_LEVELS[group.level as any];

            const existingPlan = classroom.activityPlans.find(
              (p) => p.groupId === group.id
            );

            return (
              <div
                key={group.id}
                id={`group-card-${group.id}`}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col overflow-hidden hover:border-stone-300 transition-all"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wide ${
                        levelMeta?.textBadgeClass || "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {levelMeta?.name || group.level}
                    </span>
                    <span className="text-xs font-bold text-stone-600 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                      {group.studentIds.length} student{group.studentIds.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 text-base leading-tight">
                    {group.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                    {levelMeta?.shortDesc || "Foundational skill practice"}
                  </p>
                </div>

                {/* Move Target Action Banner if moving */}
                {movingStudent && sourceGroupId !== group.id && (
                  <div className="p-2 bg-emerald-50 border-b border-emerald-200 flex justify-center">
                    <button
                      onClick={() => handleMoveStudentTo(group.id)}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <span>Move {movingStudent.name} Here</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Students List in Group */}
                <div className="p-4 flex-1 space-y-2 overflow-y-auto max-h-60">
                  {group.studentIds.length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-4 text-center">
                      No students currently assigned to this level group.
                    </p>
                  ) : (
                    group.studentIds.map((sid) => {
                      const student = getStudent(sid);
                      if (!student) return null;
                      const isPeerMentor = group.peerMentors?.includes(sid);

                      return (
                        <div
                          key={sid}
                          className="flex items-center justify-between p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] text-stone-400">
                              #{student.rollNumber}
                            </span>
                            <span className="font-medium text-stone-800 truncate">
                              {student.name}
                            </span>
                            {isPeerMentor && (
                              <span
                                title="Peer mentor helper"
                                className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full flex items-center gap-0.5"
                              >
                                <UserCheck className="w-2.5 h-2.5" />
                                <span>Peer Mentor</span>
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setMovingStudent(student);
                              setSourceGroupId(group.id);
                            }}
                            title={`Move ${student.name} to another group`}
                            className="text-stone-400 hover:text-emerald-700 p-1 rounded transition-colors cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Card Footer: Activity Plan Action */}
                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  {existingPlan ? (
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => onViewPlan(existingPlan.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>View {existingPlan.durationWeeks}-Wk Plan</span>
                      </button>

                      <button
                        onClick={() => onOpenPlanGenerator(group)}
                        title="Regenerate plan with Gemini AI"
                        className="p-1 text-stone-400 hover:text-emerald-800 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`btn-gen-plan-${group.id}`}
                      onClick={() => onOpenPlanGenerator(group)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Generate Blackboard Plan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
