import React, { useEffect } from "react";
import useStore from "../store";
import QRCode from "./QRCode";
import { minutesToTime } from "../constants";
import TAG_GROUPS from "../constants/tags.json";

export default function Detail({ selectedId, onClose }) {
  const { appointments, drafts, updateDraft, submitAppointment } = useStore();

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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <section className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-gray-900">{appointment.customerName}</h2>
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

      {isSubmitted && (
        <div className="text-xs text-green-600 font-medium mb-3">
          Previously submitted
        </div>
      )}

      {/* QR Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount $ (optional)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={draft.amount || ""}
          onChange={(e) => updateDraft(appointment.id, "amount", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="0.00"
        />
        <div className="mt-3 flex justify-center">
          <QRCode
            amount={draft.amount || 0}
            name={appointment.customerName}
            phone={appointment.mobileNumber}
            service={appointment.service}
          />
        </div>
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
                      ? groupId <= "2"
                        ? "bg-blue-100 border-blue-300 text-blue-800"
                        : "bg-purple-100 border-purple-300 text-purple-800"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
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
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
          >
            +
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <button
          onClick={async () => {
            await submitAppointment(appointment.id);
            onClose();
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition"
        >
          {isSubmitted ? "Update" : "Submit"}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 rounded-lg py-2 text-sm font-medium border border-gray-200 transition"
        >
          Back
        </button>
      </div>
    </section>
      </div>
    </div>
  );
}
