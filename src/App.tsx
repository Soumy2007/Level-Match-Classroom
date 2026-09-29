import React, { useState, useEffect, useCallback } from "react";
import {
  Classroom,
  DiagnosticSession,
  LearningGroup,
  ActivityPlan,
  ReadingLevel,
  MathLevel,
  Student,
  READING_LEVELS,
  MATH_LEVELS,
} from "./types";
import {
  loadClassrooms,
  saveClassrooms,
  getSelectedClassId,
  setSelectedClassId,
  getSyncQueue,
  addToSyncQueue,
  getOfflineSimulationState,
  setOfflineSimulationState,
  resetToDemoData,
} from "./services/storage";
import { triggerSync, isDeviceOnline } from "./services/api";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { DiagnosticTool } from "./components/DiagnosticTool";
import { GroupsView } from "./components/GroupsView";
import { ActivityPlanView } from "./components/ActivityPlanView";
import { ReportsView } from "./components/ReportsView";
import { AssessmentGuideModal } from "./components/AssessmentGuideModal";
import { NewClassModal } from "./components/NewClassModal";
import { GeneratePlanModal } from "./components/GeneratePlanModal";
import { CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";

export function App() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassIdState] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "diagnostic" | "groups" | "plans" | "reports"
  >("dashboard");

  // Network & Sync State
  const [isOfflineSimulated, setIsOfflineSimulatedState] = useState(false);
  const [isOnline, setIsOnlineState] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [isAssessmentGuideOpen, setIsAssessmentGuideOpen] = useState(false);
  const [isGeneratePlanModalOpen, setIsGeneratePlanModalOpen] = useState(false);
  const [planModalTargetGroup, setPlanModalTargetGroup] = useState<
    LearningGroup | undefined
  >(undefined);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Load
  useEffect(() => {
    const loaded = loadClassrooms();
    setClassrooms(loaded);
    const initialClassId = getSelectedClassId(loaded[0]?.id || "");
    setSelectedClassIdState(initialClassId);

    setIsOfflineSimulatedState(getOfflineSimulationState());
    setIsOnlineState(isDeviceOnline());
    setPendingSyncCount(getSyncQueue().length);
  }, []);

  // Online / Offline event listeners
  useEffect(() => {
    const handleOnlineChange = () => {
      setIsOnlineState(isDeviceOnline());
    };
    window.addEventListener("online", handleOnlineChange);
    window.addEventListener("offline", handleOnlineChange);
    return () => {
      window.removeEventListener("online", handleOnlineChange);
      window.removeEventListener("offline", handleOnlineChange);
    };
  }, []);

  const currentClass =
    classrooms.find((c) => c.id === selectedClassId) || classrooms[0];

  // Helper to update classrooms state & local persistence
  const updateClassrooms = useCallback((updated: Classroom[]) => {
    setClassrooms(updated);
    saveClassrooms(updated);
    setPendingSyncCount(getSyncQueue().length);
  }, []);

  const handleSelectClass = (id: string) => {
    setSelectedClassIdState(id);
    setSelectedClassId(id);
  };

  // Toggle Simulated Offline Mode
  const handleToggleOfflineSimulator = () => {
    const nextState = !isOfflineSimulated;
    setIsOfflineSimulatedState(nextState);
    setOfflineSimulationState(nextState);
    setIsOnlineState(!nextState && navigator.onLine);
    showToast(
      nextState
        ? "Simulated Offline Rural Mode active. Operations will queue locally."
        : "Online mode restored."
    );
  };

  // Manual Trigger Sync
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await triggerSync();
      setPendingSyncCount(getSyncQueue().length);
      showToast(res.message);
    } catch (e: any) {
      showToast(`Sync failed: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Create New Class
  const handleCreateClass = (newClass: Classroom) => {
    const updated = [...classrooms, newClass];
    updateClassrooms(updated);
    setSelectedClassIdState(newClass.id);
    setSelectedClassId(newClass.id);
    addToSyncQueue({
      type: "class_created",
      payload: { classId: newClass.id, name: newClass.name },
    });
    setPendingSyncCount(getSyncQueue().length);
    showToast(`Class "${newClass.name}" created with ${newClass.students.length} students!`);
    setActiveTab("diagnostic");
  };

  // Auto Regroup Algorithm (TaRL clustering)
  const generateGroupsForClass = (
    students: Student[],
    classId: string,
    subjectFilter: "reading" | "math" | "both" = "both"
  ): LearningGroup[] => {
    const newGroups: LearningGroup[] = [];

    // 1. Reading Groups
    if (subjectFilter === "both" || subjectFilter === "reading") {
      const readingTiers: { level: ReadingLevel; name: string }[] = [
        { level: "none", name: "Reading - Beginner / Non-Reader" },
        { level: "letter", name: "Reading - Letter Group" },
        { level: "word", name: "Reading - Word Group" },
        { level: "sentence", name: "Reading - Sentence Group" },
        { level: "paragraph", name: "Reading - Paragraph Group" },
        { level: "story", name: "Reading - Story Fluent" },
      ];

      // Find story readers to act as peer mentors
      const storyStudentIds = students
        .filter((s) => s.currentReadingLevel === "story")
        .map((s) => s.id);

      readingTiers.forEach((tier) => {
        const matchingIds = students
          .filter((s) => s.currentReadingLevel === tier.level)
          .map((s) => s.id);

        if (matchingIds.length > 0) {
          // Assign peer mentor if lower level and mentor available
          const peerMentors =
            tier.level !== "story" && storyStudentIds.length > 0
              ? [storyStudentIds[newGroups.length % storyStudentIds.length]]
              : undefined;

          newGroups.push({
            id: `grp-r-${tier.level}-${Date.now()}`,
            classId,
            name: tier.name,
            subject: "reading",
            level: tier.level,
            studentIds: matchingIds,
            peerMentors,
          });
        }
      });
    }

    // 2. Math Groups
    if (subjectFilter === "both" || subjectFilter === "math") {
      const mathTiers: { level: MathLevel; name: string }[] = [
        { level: "none", name: "Math - Beginner / Counting" },
        { level: "single-digit", name: "Math - 1-Digit Numbers (1–9)" },
        { level: "two-digit-no-carry", name: "Math - 2-Digit Addition (No Carry)" },
        { level: "two-digit-with-carry", name: "Math - 2-Digit Subtraction / Regroup" },
        { level: "multiplication-division", name: "Math - Multiplication & Division" },
      ];

      const advancedMathIds = students
        .filter(
          (s) =>
            s.currentMathLevel === "multiplication-division" ||
            s.currentMathLevel === "two-digit-with-carry"
        )
        .map((s) => s.id);

      mathTiers.forEach((tier) => {
        const matchingIds = students
          .filter((s) => s.currentMathLevel === tier.level)
          .map((s) => s.id);

        if (matchingIds.length > 0) {
          const peerMentors =
            tier.level !== "multiplication-division" && advancedMathIds.length > 0
              ? [advancedMathIds[newGroups.length % advancedMathIds.length]]
              : undefined;

          newGroups.push({
            id: `grp-m-${tier.level}-${Date.now()}`,
            classId,
            name: tier.name,
            subject: "math",
            level: tier.level,
            studentIds: matchingIds,
            peerMentors,
          });
        }
      });
    }

    return newGroups;
  };

  // Save Diagnostic
  const handleSaveDiagnostic = (
    session: DiagnosticSession,
    autoGenerateGroups: boolean
  ) => {
    if (!currentClass) return;

    // Update students in current class
    const updatedStudents = currentClass.students.map((student) => {
      const entry = session.entries.find((e) => e.studentId === student.id);
      if (!entry) return student;

      const hasChanged =
        entry.readingLevel !== student.currentReadingLevel ||
        entry.mathLevel !== student.currentMathLevel;

      const history = [...student.history];
      if (hasChanged) {
        history.push({
          date: session.date,
          readingLevel: entry.readingLevel,
          mathLevel: entry.mathLevel,
          notes: entry.notes || session.title,
        });
      }

      return {
        ...student,
        currentReadingLevel: entry.readingLevel,
        currentMathLevel: entry.mathLevel,
        lastAssessedDate: session.date,
        history,
      };
    });

    let updatedGroups = currentClass.groups;
    if (autoGenerateGroups) {
      updatedGroups = generateGroupsForClass(
        updatedStudents,
        currentClass.id,
        "both"
      );
    }

    const updatedClass: Classroom = {
      ...currentClass,
      students: updatedStudents,
      groups: updatedGroups,
      diagnostics: [...currentClass.diagnostics, session],
    };

    const nextClassrooms = classrooms.map((c) =>
      c.id === currentClass.id ? updatedClass : c
    );

    addToSyncQueue({
      type: "diagnostic_saved",
      payload: { sessionId: session.id, date: session.date },
    });

    updateClassrooms(nextClassrooms);
    showToast(
      autoGenerateGroups
        ? "Diagnostic recorded! Student groups automatically reclustered."
        : "Diagnostic records saved successfully."
    );

    if (autoGenerateGroups) {
      setActiveTab("groups");
    }
  };

  // Manual Trigger: Auto Regroup from current student levels
  const handleAutoRegroup = (subject: "reading" | "math" | "both") => {
    if (!currentClass) return;

    const regenerated = generateGroupsForClass(
      currentClass.students,
      currentClass.id,
      subject
    );

    // If regrouping only reading, keep math groups and replace reading, and vice-versa
    let finalGroups: LearningGroup[] = [];
    if (subject === "reading") {
      finalGroups = [
        ...regenerated,
        ...currentClass.groups.filter((g) => g.subject === "math"),
      ];
    } else if (subject === "math") {
      finalGroups = [
        ...currentClass.groups.filter((g) => g.subject === "reading"),
        ...regenerated,
      ];
    } else {
      finalGroups = regenerated;
    }

    const updatedClass: Classroom = {
      ...currentClass,
      groups: finalGroups,
    };

    const nextClassrooms = classrooms.map((c) =>
      c.id === currentClass.id ? updatedClass : c
    );

    addToSyncQueue({
      type: "groups_updated",
      payload: { classId: currentClass.id, subject },
    });

    updateClassrooms(nextClassrooms);
    showToast(`Regrouped ${subject} learning levels for ${currentClass.name}!`);
  };

  // Move students between groups
  const handleUpdateGroupStudents = (groupId: string, newStudentIds: string[]) => {
    if (!currentClass) return;
    const updatedGroups = currentClass.groups.map((g) =>
      g.id === groupId ? { ...g, studentIds: newStudentIds } : g
    );

    const updatedClass = { ...currentClass, groups: updatedGroups };
    const nextClassrooms = classrooms.map((c) =>
      c.id === currentClass.id ? updatedClass : c
    );

    addToSyncQueue({
      type: "groups_updated",
      payload: { groupId, count: newStudentIds.length },
    });

    updateClassrooms(nextClassrooms);
  };

  // Plan Generated
  const handlePlanGenerated = (newPlan: any, targetGroupId: string) => {
    if (!currentClass) return;

    // Filter out previous plan for this group if exists
    const filteredPlans = currentClass.activityPlans.filter(
      (p) => p.groupId !== targetGroupId
    );

    const updatedClass: Classroom = {
      ...currentClass,
      activityPlans: [newPlan, ...filteredPlans],
    };

    const nextClassrooms = classrooms.map((c) =>
      c.id === currentClass.id ? updatedClass : c
    );

    updateClassrooms(nextClassrooms);
    setSelectedPlanId(newPlan.id);
    setActiveTab("plans");
    showToast(`Blackboard Plan ready for ${newPlan.groupName}!`);
  };

  // Toggle Day Completed
  const handleToggleDayCompleted = (
    planId: string,
    weekNum: number,
    dayNum: number
  ) => {
    if (!currentClass) return;

    const key = `w${weekNum}-d${dayNum}`;
    const updatedPlans = currentClass.activityPlans.map((p) => {
      if (p.id !== planId) return p;
      const currentCompleted = p.completedDays || {};
      const nextCompleted = {
        ...currentCompleted,
        [key]: !currentCompleted[key],
      };
      return {
        ...p,
        completedDays: nextCompleted,
      };
    });

    const updatedClass = {
      ...currentClass,
      activityPlans: updatedPlans,
    };

    const nextClassrooms = classrooms.map((c) =>
      c.id === currentClass.id ? updatedClass : c
    );

    updateClassrooms(nextClassrooms);
  };

  // Reset to Demo Data
  const handleResetDemo = () => {
    if (confirm("Reset classroom data back to original sample data?")) {
      const resetData = resetToDemoData();
      setClassrooms(resetData);
      setSelectedClassIdState(resetData[0].id);
      setSelectedClassId(resetData[0].id);
      setPendingSyncCount(0);
      showToast("Classroom reset to initial demo state.");
    }
  };

  if (!currentClass) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-stone-600">Loading LevelMatch Classroom...</p>
          <button
            onClick={handleResetDemo}
            className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-lg"
          >
            Load Sample Classroom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans antialiased">
      {/* Header with status, switcher, tabs */}
      <Header
        classrooms={classrooms}
        selectedClassId={selectedClassId}
        onSelectClass={handleSelectClass}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOnline={isOnline}
        isOfflineSimulated={isOfflineSimulated}
        onToggleOfflineSimulator={handleToggleOfflineSimulator}
        pendingSyncCount={pendingSyncCount}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        onOpenNewClassModal={() => setIsNewClassModalOpen(true)}
        onOpenAssessmentGuide={() => setIsAssessmentGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium border border-stone-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Dashboard */}
        {activeTab === "dashboard" && (
          <DashboardView
            classroom={currentClass}
            onNavigateTab={setActiveTab}
            onOpenAssessmentGuide={() => setIsAssessmentGuideOpen(true)}
            onOpenPlanModal={(group) => {
              setPlanModalTargetGroup(group);
              setIsGeneratePlanModalOpen(true);
            }}
          />
        )}

        {/* Tab 2: Quick Diagnostic */}
        {activeTab === "diagnostic" && (
          <DiagnosticTool
            classroom={currentClass}
            onSaveDiagnostic={handleSaveDiagnostic}
            onOpenAssessmentGuide={() => setIsAssessmentGuideOpen(true)}
          />
        )}

        {/* Tab 3: Student Groups */}
        {activeTab === "groups" && (
          <GroupsView
            classroom={currentClass}
            onUpdateGroupStudents={handleUpdateGroupStudents}
            onAutoRegroup={handleAutoRegroup}
            onOpenPlanGenerator={(group) => {
              setPlanModalTargetGroup(group);
              setIsGeneratePlanModalOpen(true);
            }}
            onViewPlan={(planId) => {
              setSelectedPlanId(planId);
              setActiveTab("plans");
            }}
          />
        )}

        {/* Tab 4: Blackboard Plans */}
        {activeTab === "plans" && (
          <ActivityPlanView
            classroom={currentClass}
            plans={currentClass.activityPlans}
            selectedPlanId={selectedPlanId}
            onSelectPlan={setSelectedPlanId}
            onToggleDayCompleted={handleToggleDayCompleted}
            onOpenGenerateModal={(group) => {
              setPlanModalTargetGroup(group);
              setIsGeneratePlanModalOpen(true);
            }}
          />
        )}

        {/* Tab 5: Reports & Print */}
        {activeTab === "reports" && <ReportsView classroom={currentClass} />}
      </main>

      {/* Footer (hidden in print) */}
      <footer className="bg-white border-t border-stone-200 py-4 text-xs text-stone-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">LevelMatch Classroom</span>
            <span>•</span>
            <span>Teaching at the Right Level (TaRL)</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">
              Zero-Cost Blackboard Pedagogy
            </span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <button
              onClick={handleResetDemo}
              className="hover:text-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset to factory sample data"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo Classroom</span>
            </button>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AssessmentGuideModal
        isOpen={isAssessmentGuideOpen}
        onClose={() => setIsAssessmentGuideOpen(false)}
        onStartDiagnostic={() => {
          setIsAssessmentGuideOpen(false);
          setActiveTab("diagnostic");
        }}
      />

      <NewClassModal
        isOpen={isNewClassModalOpen}
        onClose={() => setIsNewClassModalOpen(false)}
        onCreateClass={handleCreateClass}
      />

      <GeneratePlanModal
        isOpen={isGeneratePlanModalOpen}
        onClose={() => setIsGeneratePlanModalOpen(false)}
        classroom={currentClass}
        targetGroup={planModalTargetGroup}
        onPlanGenerated={handlePlanGenerated}
      />
    </div>
  );
}

export default App;

