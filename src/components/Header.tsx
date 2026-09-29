import React from "react";
import { Classroom } from "../types";
import {
  School,
  Wifi,
  WifiOff,
  RefreshCw,
  FileSpreadsheet,
  Users,
  LayoutDashboard,
  Sparkles,
  Printer,
  HelpCircle,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface HeaderProps {
  classrooms: Classroom[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  activeTab: "dashboard" | "diagnostic" | "groups" | "plans" | "reports";
  onSelectTab: (tab: "dashboard" | "diagnostic" | "groups" | "plans" | "reports") => void;
  isOnline: boolean;
  isOfflineSimulated: boolean;
  onToggleOfflineSimulator: () => void;
  pendingSyncCount: number;
  onTriggerSync: () => void;
  isSyncing: boolean;
  onOpenNewClassModal: () => void;
  onOpenAssessmentGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  classrooms,
  selectedClassId,
  onSelectClass,
  activeTab,
  onSelectTab,
  isOnline,
  isOfflineSimulated,
  onToggleOfflineSimulator,
  pendingSyncCount,
  onTriggerSync,
  isSyncing,
  onOpenNewClassModal,
  onOpenAssessmentGuide,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
    {
      id: "diagnostic",
      label: "Quick Diagnostic",
      icon: FileSpreadsheet,
      badge: "5-Min",
    },
    {
      id: "groups",
      label: "Student Groups",
      icon: Users,
      badge: currentClass ? `${currentClass.groups.length}` : null,
    },
    {
      id: "plans",
      label: "Blackboard Plans",
      icon: Sparkles,
      badge: currentClass?.activityPlans.length ? `${currentClass.activityPlans.length}` : null,
    },
    { id: "reports", label: "Reports & Print", icon: Printer, badge: null },
  ] as const;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-xs print:hidden">
      {/* Offline Status Bar Banner if offline or simulated */}
      {!isOnline && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-medium flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> All changes, diagnostic scores, and lesson plans are saved securely to your device and queued for cloud sync.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {pendingSyncCount > 0 && (
              <span className="bg-amber-600/30 text-amber-950 px-2 py-0.5 rounded-full font-semibold">
                {pendingSyncCount} action{pendingSyncCount > 1 ? "s" : ""} pending
              </span>
            )}
            <button
              onClick={onToggleOfflineSimulator}
              className="underline hover:text-white font-semibold cursor-pointer"
            >
              {isOfflineSimulated ? "Turn Off Offline Simulation" : "Check Connection"}
            </button>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Class Switcher */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-xs shrink-0">
              <School className="w-5 h-5 text-emerald-100" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 tracking-tight text-base sm:text-lg truncate">
                  LevelMatch Classroom
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  TaRL / FLN
                </span>
              </div>

              {/* Class Dropdown */}
              <div className="flex items-center gap-1 text-xs text-stone-500">
                <label htmlFor="class-select" className="sr-only">Select Classroom</label>
                <select
                  id="class-select"
                  value={selectedClassId}
                  onChange={(e) => onSelectClass(e.target.value)}
                  className="bg-stone-100 hover:bg-stone-200/70 text-stone-800 font-medium py-0.5 px-2 rounded-md border border-stone-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.students.length} students)
                    </option>
                  ))}
                </select>

                <button
                  onClick={onOpenNewClassModal}
                  title="Create a new class"
                  className="p-1 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-md transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Action Controls: Offline Toggle & Sync Status */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Paper Assessment Tool Guide helper */}
            <button
              id="btn-assessment-guide"
              onClick={onOpenAssessmentGuide}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200 cursor-pointer"
              title="View the 5-Minute Paper Diagnostic Sheet (Letters, Words, Stories, Math)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Paper Tool Guide</span>
            </button>

            {/* Offline simulator switch */}
            <button
              id="btn-toggle-offline-sim"
              onClick={onToggleOfflineSimulator}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isOfflineSimulated
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
              }`}
              title={isOfflineSimulated ? "Simulating offline rural school. Click to switch to Online." : "Click to simulate offline rural classroom"}
            >
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span className="hidden sm:inline">
                {isOfflineSimulated ? "Offline Simulated" : isOnline ? "Online" : "Offline"}
              </span>
            </button>

            {/* Sync Now / Pending Status */}
            <button
              id="btn-trigger-sync"
              onClick={onTriggerSync}
              disabled={isSyncing || !isOnline || pendingSyncCount === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                pendingSyncCount > 0 && isOnline
                  ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                  : pendingSyncCount > 0
                  ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
              title={pendingSyncCount > 0 ? "Push pending offline changes to cloud" : "All local changes synced"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>
                {isSyncing
                  ? "Syncing..."
                  : pendingSyncCount > 0
                  ? `Sync (${pendingSyncCount})`
                  : "Synced"}
              </span>
              {pendingSyncCount === 0 && !isSyncing && (
                <CheckCircle2 className="w-3 h-3 text-emerald-600 hidden sm:inline" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar border-t border-stone-100 py-1.5">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-200" : "text-stone-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-emerald-950/40 text-emerald-100"
                        : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
