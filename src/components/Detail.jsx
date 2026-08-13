import React, { useEffect, useState } from "react";
import useStore from "../store";
import QRCode from "./QRCode";
import { minutesToTime } from "../constants";
import TAG_GROUPS from "../constants/tags.json";

export default function Detail({ selectedId, onClose }) {
  const { appointments, drafts, updateDraft, submitAppointment, deleteAppointment, showToast } = useStore();
  const [deleting, setDeleting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const appointment = appointments.find((a) => a.id === selectedId);
  const draft = selectedId ? drafts[selectedId] || {} : {};

  // Pre-populate draft for submitted records
  useEffect(() => {
    if (selectedId && appointment?.submitted && !drafts[selectedId]) {
      updateDraft(selectedId, "amount", String(appointment.amount || ""));
      updateDraft(selectedId, "tags", appointment.tags || []);
      updateDraft(selectedId, "customTags", []);
    }
  }, [selectedId]);

  if (!appointment) return null;

  const tags = [...(draft.tags || []), ...(draft.customTags || [])];
  const isSubmitted = appointment.submitted;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center sm:p-2 overflow-y-auto" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-[560px] sm:rounded-xl rounded-2xl shadow-2xl m-4 mb-8" onClick={(e) => e.stopPropagation()}>
      <section className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-medium text-gray-900">{appointment.customerName}</h2>
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="text-xs text-[#c7006a] hover:text-[#c7006a]/70 font-medium px-2 py-0.5 rounded border border-[#cfad5d]/30 bg-white transition"
          >
            History
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          Close
        </button>
      </div>

      <div className="text-xs text-gray-400 italic mb-3">
        {minutesToTime(appointment.timeMinutes)} — {appointment.service}
      </div>

      {showHistory && <HistoryPanel appointments={appointments} current={appointment} onClose={() => setShowHistory(false)} />}

      {isSubmitted && (
        <div className="text-xs text-green-600 font-medium mb-3">
          Previously submitted
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount $
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={draft.amount ?? appointment.amount ?? ""}
          onChange={(e) => { console.log("[Detail] amount input -> updateDraft amount=%j", e.target.value); updateDraft(appointment.id, "amount", e.target.value); }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="0.00"
        />
        {!appointment.submitted && (
          <div className="mt-3 flex justify-center">
            <QRCode
              amount={draft.amount || 0}
              name={appointment.customerName}
              phone={appointment.mobileNumber}
              service={appointment.service}
              id={appointment.id}
            />
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        {Object.entries(TAG_GROUPS).map(([groupId, groupTags]) => (
          groupTags.length > 0 ? (
            <div key={groupId} className="flex flex-wrap gap-1.5 mb-1">
              {groupTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const current = draft.tags || [];
                    const next = current.includes(tag)
                      ? current.filter((t) => t !== tag)
                      : [...current, tag];
                    updateDraft(appointment.id, "tags", next);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                    (draft.tags || []).includes(tag)
                      ? "bg-[#fad5da] border-[#cfad5d] text-[#c7006a]"
                      : "bg-white border-gray-200 text-[#c7006a] hover:border-[#cfad5d]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <div key={groupId} className="mb-4" />
          )
        ))}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={draft._customTag || ""}
            onChange={(e) => updateDraft(appointment.id, "_customTag", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                const current = draft.customTags || [];
                updateDraft(appointment.id, "customTags", [
                  ...current,
                  e.target.value.trim(),
                ]);
                updateDraft(appointment.id, "_customTag", "");
              }
            }}
            placeholder="Add custom tag..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (draft._customTag && draft._customTag.trim()) {
                const current = draft.customTags || [];
                updateDraft(appointment.id, "customTags", [
                  ...current,
                  draft._customTag.trim(),
                ]);
                updateDraft(appointment.id, "_customTag", "");
              }
            }}
            className="px-3 py-1.5 bg-[#fbecf5] hover:bg-[#fad5da] rounded-lg text-sm font-medium text-[#c7006a] transition"
          >
            +
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(draft.tags || []).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                {tag}
                <button type="button"
                  onClick={() => updateDraft(appointment.id, "tags", (draft.tags || []).filter((t) => t !== tag))}
                  className="text-gray-400 hover:text-gray-600 leading-none">&times;</button>
              </span>
            ))}
            {(draft.customTags || []).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                {tag}
                <button type="button"
                  onClick={() => updateDraft(appointment.id, "customTags", (draft.customTags || []).filter((t) => t !== tag))}
                  className="text-gray-400 hover:text-gray-600 leading-none">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => {
            onClose();
            submitAppointment(appointment.id)
              .then(() => showToast(isSubmitted ? "Updated" : "Submitted"))
              .catch(() => showToast("Submission failed"));
          }}
          className="flex-1 bg-[#c7006a] hover:bg-[#c7006a]/80 text-white rounded-lg py-2 text-sm font-medium transition"
        >
          {isSubmitted ? "Update" : "Submit"}
        </button>
        <button
          onClick={async () => {
            if (!confirm(`Delete ${appointment.customerName}?`)) return;
            setDeleting(true);
            try {
              await deleteAppointment(appointment.id);
              showToast("Deleted");
              onClose();
            } catch {
              showToast("Delete failed");
            } finally {
              setDeleting(false);
            }
          }}
          disabled={deleting}
          className="px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-40"
        >
          {deleting ? "..." : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-white hover:bg-[#fad5da]/60 text-[#c7006a] rounded-lg py-2 text-sm font-medium border border-[#cfad5d]/20 transition"
        >
          Back
        </button>
      </div>
    </section>
      </div>
    </div>
  );
}

function HistoryPanel({ appointments, current, onClose }) {
  const shortDate = (iso) => {
    const d = new Date(iso);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };
  const history = appointments.filter(
    (a) => a.mobileNumber && current.mobileNumber && a.mobileNumber === current.mobileNumber && a.id !== current.id
  ).sort((a, b) => (b.date + String(b.timeMinutes).padStart(5, "0")).localeCompare(a.date + String(a.timeMinutes).padStart(5, "0")));

  return (
    <div className="mb-3 bg-gray-50 rounded-lg border border-gray-200 p-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-700">Past appointments <span className="text-gray-400 font-normal">({history.length})</span></span>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">&times;</button>
      </div>
      {history.length === 0 ? (
        <p className="text-gray-400 text-xs">No previous appointments found.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {history.map((a) => (
            <div key={a.id} className="flex items-center justify-between bg-white rounded px-2 py-1.5 border border-gray-100">
              <div>
                <span className="text-gray-700 font-medium">{a.customerName}</span>
                <span className="text-gray-400 ml-2 text-xs">
                  {shortDate(a.date)} {minutesToTime(a.timeMinutes)} &middot; {a.service}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {a.submitted && a.amount > 0 && (
                  <span className="text-green-600 text-xs font-medium">${Number(a.amount).toFixed(2)}</span>
                )}
                {a.tags?.length > 0 && (
                  <span className="text-gray-400 text-xs">{a.tags.slice(0, 2).join(", ")}{a.tags.length > 2 ? "..." : ""}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
