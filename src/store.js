import { create } from "zustand";
import { sortTags } from "./constants";

const DRAFTS_KEY = "thoselashes-drafts";

const useStore = create((set, get) => ({
  appointments: [],
  drafts: loadItem(DRAFTS_KEY, {}),
  toast: null,

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

  // `draft` is captured by the caller BEFORE onClose() clears it, so submit
  // reads the real values instead of the already-cleared (empty) draft.
  submitAppointment: async (id, draft) => {
    const { appointments } = get();
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return;

    draft = draft || {};
    console.log("[submitAppointment] id=%s draft.amount=%j -> amount=%j", id, draft.amount, Number(draft.amount) || 0);

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
        amount: Number(draft.amount) || 0,
        tags: sortTags(draft.tags || []),
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
    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    await get().fetchAppointments();
  },

  createRecord: async (data) => {
    console.log("[createRecord] sending amount=%j (raw=%j)", Number(data.amount || 0), data.amount);
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create record");
    await get().fetchAppointments();
  },

  updateDraft: (id, field, value) => {
    const drafts = { ...get().drafts, [id]: { ...get().drafts[id], [field]: value } };
    saveItem(DRAFTS_KEY, drafts);
    set({ drafts });
  },

  clearDraft: (id) => {
    const drafts = { ...get().drafts };
    delete drafts[id];
    saveItem(DRAFTS_KEY, drafts);
    set({ drafts });
  },

  showToast: (message) => set({ toast: message }),
  clearToast: () => set({ toast: null }),
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
