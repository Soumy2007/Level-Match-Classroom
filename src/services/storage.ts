import { Classroom, SyncQueueItem, DiagnosticSession, LearningGroup, ActivityPlan, Student } from "../types";
import { INITIAL_CLASSROOMS } from "../data/initialData";

const STORAGE_KEY_CLASSES = "levelmatch_classrooms_v1";
const STORAGE_KEY_SELECTED_CLASS = "levelmatch_selected_class_id_v1";
const STORAGE_KEY_SYNC_QUEUE = "levelmatch_sync_queue_v1";
const STORAGE_KEY_LAST_SYNC = "levelmatch_last_synced_at_v1";
const STORAGE_KEY_OFFLINE_SIMULATOR = "levelmatch_simulate_offline_v1";

export function loadClassrooms(): Classroom[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (!raw) {
      saveClassrooms(INITIAL_CLASSROOMS);
      return INITIAL_CLASSROOMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not load classrooms from localStorage, using initial data:", err);
    return INITIAL_CLASSROOMS;
  }
}

export function saveClassrooms(classrooms: Classroom[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classrooms));
  } catch (err) {
    console.error("Failed to save classrooms to localStorage:", err);
  }
}

export function getSelectedClassId(defaultId: string): string {
  try {
    return localStorage.getItem(STORAGE_KEY_SELECTED_CLASS) || defaultId;
  } catch {
    return defaultId;
  }
}

export function setSelectedClassId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED_CLASS, id);
  } catch (err) {
    console.error("Failed to save selected class ID:", err);
  }
}

export function getSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "timestamp">): SyncQueueItem {
  const queue = getSyncQueue();
  const newItem: SyncQueueItem = {
    ...item,
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  queue.push(newItem);
  try {
    localStorage.setItem(STORAGE_KEY_SYNC_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error("Error updating sync queue:", e);
  }
  return newItem;
}

export function clearSyncQueue(): void {
  try {
    localStorage.setItem(STORAGE_KEY_SYNC_QUEUE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
  } catch (e) {
    console.error("Error clearing sync queue:", e);
  }
}

export function getLastSyncedAt(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_LAST_SYNC);
  } catch {
    return null;
  }
}

export function getOfflineSimulationState(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_OFFLINE_SIMULATOR) === "true";
  } catch {
    return false;
  }
}

export function setOfflineSimulationState(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_OFFLINE_SIMULATOR, enabled ? "true" : "false");
  } catch (e) {
    console.error("Error saving offline simulator state:", e);
  }
}

// Reset data to factory sample defaults
export function resetToDemoData(): Classroom[] {
  try {
    localStorage.removeItem(STORAGE_KEY_CLASSES);
    localStorage.removeItem(STORAGE_KEY_SYNC_QUEUE);
    localStorage.removeItem(STORAGE_KEY_LAST_SYNC);
    saveClassrooms(INITIAL_CLASSROOMS);
    return INITIAL_CLASSROOMS;
  } catch {
    return INITIAL_CLASSROOMS;
  }
}
