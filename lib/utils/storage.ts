import { InterviewState } from "@/lib/types/interview";

const STORAGE_KEY = "interview_ai_data";

interface StorageData {
  interviews: Record<string, InterviewState>;
  currentInterviewId: string | null;
}

// Get all data from localStorage
export function getStorageData(): StorageData {
  if (typeof window === "undefined") {
    return { interviews: {}, currentInterviewId: null };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { interviews: {}, currentInterviewId: null };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return { interviews: {}, currentInterviewId: null };
  }
}

// Save all data to localStorage
export function setStorageData(data: StorageData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
}

// Save interview
export function saveInterview(interview: InterviewState): void {
  const data = getStorageData();
  data.interviews[interview.interviewId] = interview;
  setStorageData(data);
}

// Get interview by ID
export function getInterview(interviewId: string): InterviewState | null {
  const data = getStorageData();
  return data.interviews[interviewId] || null;
}

// Get all interviews
export function getAllInterviews(): InterviewState[] {
  const data = getStorageData();
  return Object.values(data.interviews).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

// Set current interview ID
export function setCurrentInterviewId(interviewId: string | null): void {
  const data = getStorageData();
  data.currentInterviewId = interviewId;
  setStorageData(data);
}

// Get current interview ID
export function getCurrentInterviewId(): string | null {
  const data = getStorageData();
  return data.currentInterviewId;
}

// Delete interview
export function deleteInterview(interviewId: string): void {
  const data = getStorageData();
  delete data.interviews[interviewId];
  if (data.currentInterviewId === interviewId) {
    data.currentInterviewId = null;
  }
  setStorageData(data);
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
