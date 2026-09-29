import { ActivityPlan, SyncQueueItem } from "../types";
import { getOfflineSimulationState, addToSyncQueue, clearSyncQueue, getSyncQueue } from "./storage";

export function isDeviceOnline(): boolean {
  if (typeof window === "undefined") return true;
  if (getOfflineSimulationState()) return false;
  return navigator.onLine;
}

export interface GeneratePlanParams {
  groupLevel: string;
  subject: "reading" | "math";
  durationWeeks: number;
  className: string;
  studentCount: number;
  language?: string;
  context?: string;
}

export async function requestActivityPlan(params: GeneratePlanParams): Promise<{
  plan: any;
  source: string;
  offlineQueued?: boolean;
}> {
  const online = isDeviceOnline();

  // If offline, generate locally from pedagogical knowledge base & queue
  if (!online) {
    console.log("Device is offline. Using local offline pedagogical generator.");
    const offlinePlan = generateClientSidePlan(params.subject, params.groupLevel, params.durationWeeks, params.className);
    addToSyncQueue({
      type: "plan_generated",
      payload: { params, generatedAt: new Date().toISOString() },
    });
    return {
      plan: offlinePlan,
      source: "Offline Master Curriculum (Local Storage)",
      offlineQueued: true,
    };
  }

  try {
    const res = await fetch("/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      plan: data.plan,
      source: data.source === "gemini_ai" ? "Gemini 3.8 Flash (Server AI)" : "Curated FLN Curriculum",
    };
  } catch (err: any) {
    console.warn("Failed to reach server API, using local offline fallback:", err);
    const offlinePlan = generateClientSidePlan(params.subject, params.groupLevel, params.durationWeeks, params.className);
    addToSyncQueue({
      type: "plan_generated",
      payload: { params, error: err.message, generatedAt: new Date().toISOString() },
    });
    return {
      plan: offlinePlan,
      source: "Offline FLN Curriculum (Local Fallback)",
      offlineQueued: true,
    };
  }
}

export async function triggerSync(): Promise<{ success: boolean; syncedCount: number; message: string }> {
  const queue = getSyncQueue();
  if (queue.length === 0) {
    return { success: true, syncedCount: 0, message: "All classroom data is already synced." };
  }

  if (!isDeviceOnline()) {
    return { success: false, syncedCount: 0, message: "Cannot sync while offline. Please connect to internet or toggle offline mode off." };
  }

  try {
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queue,
        clientTimestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) throw new Error("Sync server responded with error");
    const count = queue.length;
    clearSyncQueue();
    return {
      success: true,
      syncedCount: count,
      message: `Successfully synchronized ${count} record(s) with cloud database!`,
    };
  } catch (e: any) {
    return {
      success: false,
      syncedCount: 0,
      message: `Sync failed: ${e.message}. Changes remain safe in offline storage.`,
    };
  }
}

// Client-side instant curriculum builder for offline use
function generateClientSidePlan(subject: string, groupLevel: string, durationWeeks: number, className: string) {
  const isReading = subject.toLowerCase().includes("read");
  const weeks = [];

  for (let w = 1; w <= durationWeeks; w++) {
    const days = [];
    for (let d = 1; d <= 5; d++) {
      if (isReading) {
        days.push({
          dayNumber: d,
          objective: `Day ${d}: Active phonics & oral vocabulary consolidation (${groupLevel.toUpperCase()} level)`,
          blackboardSetup: `Chalkboard column: Target sounds/words for Day ${d}. Drawn sound ladder with 5 steps.`,
          activities: [
            { step: 1, title: "Whole-Class Oral Chant", description: "Rhythmic clapping while chanting target sounds and words together.", durationMinutes: 10 },
            { step: 2, title: "Blackboard Guided Drill", description: "Teacher models word building with chalk; student pairs come up to circle target items.", durationMinutes: 15 },
            { step: 3, title: "Slate & Notebook Practice", description: "Students write in rough notebooks and read aloud to their designated peer partner.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "White chalk", "Student Slates / Rough Notebooks"],
          oralGame: "Fast Finger Find: Point to the word on blackboard before neighbor touches slate.",
          teacherTips: "Praise attempts immediately. Focus on clarity and volume of children's voices.",
        });
      } else {
        days.push({
          dayNumber: d,
          objective: `Day ${d}: Foundational numeracy with place value and counting (${groupLevel.toUpperCase()} level)`,
          blackboardSetup: `Tens (T) & Ones (O) column with drawn stick bundles and loose pebble counters.`,
          activities: [
            { step: 1, title: "Physical Object Counting", description: "Children count bottle caps or pebbles in groups of 5 and 10.", durationMinutes: 12 },
            { step: 2, title: "Chalkboard Step Solving", description: "Teacher solves 2 examples step-by-step; student volunteers solve with peers.", durationMinutes: 15 },
            { step: 3, title: "Slate Speed Check", description: "Teacher says a problem aloud; children write answer on slates and flip upward.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Chalk", "Pebbles/Bottle caps", "Rough Notebooks"],
          oralGame: "Number Detective: Guess the secret number with 'greater than / less than' clues.",
          teacherTips: "Do not move to paper worksheets. Use floor chalk grids for active physical jumping.",
        });
      }
    }
    weeks.push({
      weekNumber: w,
      focus: `Week ${w}: Low-resource ${subject} foundational acceleration (${groupLevel} level)`,
      days,
    });
  }

  return {
    title: `${isReading ? "Reading" : "Math"} Plan (${groupLevel.toUpperCase()} Level)`,
    summary: `Structured ${durationWeeks}-week blackboard & oral lesson plan. Tailored for ${className} with zero required printing.`,
    subject,
    level: groupLevel,
    durationWeeks,
    weeks,
  };
}
