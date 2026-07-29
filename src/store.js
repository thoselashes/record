import { create } from "zustand";

const DRAFTS_KEY = "thoselashes-drafts";

const useStore = create((set, get) => ({
  appointments: [],
  drafts: loadItem(DRAFTS_KEY, {}),

  fetchAppointments: async () => {
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      set({ appointments: data });
    } catch {
      set({ appointments: [] });
    }
  },

  submitAppointment: async (id) => {
    const { appointments, drafts } = get();
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return;

    const draft = drafts[id] || {};

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: appointment.id,
        date: appointment.date,
        timeMinutes: appointment.timeMinutes,
        service: appointment.service,
        customerName: appointment.customerName,
        mobileNumber: appointment.mobileNumber,
        email: appointment.email,
        timePaid: draft.timePaid || "",
        amount: draft.amount || 0,
        tags: draft.tags || [],
        customTags: draft.customTags || [],
      }),
    });

    if (!res.ok) throw new Error("Submission failed");

    const updatedDrafts = { ...drafts };
    delete updatedDrafts[id];
    saveItem(DRAFTS_KEY, updatedDrafts);
    set({ drafts: updatedDrafts });

    await get().fetchAppointments();
  },

  deleteAppointment: async (id) => {
    const { appointments } = get();
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return;

    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");

    await get().fetchAppointments();
  },

  updateDraft: (id, field, value) => {
    const drafts = { ...get().drafts, [id]: { ...get().drafts[id], [field]: value } };
    saveItem(DRAFTS_KEY, drafts);
    set({ drafts });
  },
}));

function loadItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — silently drop
  }
}

export default useStore;
