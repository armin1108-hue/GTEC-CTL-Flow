import type { Program, Participant, SurveySummary } from "../types/program";

const API_BASE = "/api";

// Helper to make API requests with error handling
const apiRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API Request failed on ${url}:`, error);
    throw error;
  }
};

// Initialize Storage: dummy function since backend initializes itself
export const initializeStorage = (): void => {
  // Database initializes dynamically on server startup.
};

// Reset database to initial mock data
export const resetStorageToDefault = async (): Promise<void> => {
  await apiRequest<any>("/reset", { method: "POST" });
};

// Program CRUD Operations
export const getPrograms = async (): Promise<Program[]> => {
  return await apiRequest<Program[]>("/programs");
};

export const getProgramById = async (id: string): Promise<Program | undefined> => {
  try {
    return await apiRequest<Program>(`/programs/${id}`);
  } catch (err) {
    return undefined;
  }
};

export const saveProgram = async (program: Program): Promise<void> => {
  await apiRequest<Program>("/programs", {
    method: "POST",
    body: JSON.stringify(program),
  });
};

export const deleteProgram = async (id: string): Promise<void> => {
  await apiRequest<any>(`/programs/${id}`, {
    method: "DELETE",
  });
};

// Participant CRUD Operations
export const getParticipants = async (programId?: string): Promise<Participant[]> => {
  const url = programId ? `/participants?programId=${encodeURIComponent(programId)}` : "/participants";
  return await apiRequest<Participant[]>(url);
};

export const saveParticipant = async (participant: Participant): Promise<void> => {
  await apiRequest<Participant>("/participants", {
    method: "POST",
    body: JSON.stringify(participant),
  });
};

export const saveParticipantsBulk = async (participants: Participant[]): Promise<void> => {
  await apiRequest<any>("/participants/bulk", {
    method: "POST",
    body: JSON.stringify(participants),
  });
};

export const deleteParticipant = async (id: string, _programId: string): Promise<void> => {
  // programId is not strictly needed for deletion on backend since ID is unique, but kept for interface consistency
  await apiRequest<any>(`/participants/${id}`, {
    method: "DELETE",
  });
};

// Update program survey summary
export const saveSurveySummary = async (programId: string, survey: SurveySummary): Promise<void> => {
  await apiRequest<any>(`/programs/${programId}/survey`, {
    method: "POST",
    body: JSON.stringify(survey),
  });
};
