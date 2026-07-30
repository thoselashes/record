import React, { useEffect, useMemo, useState } from "react";
import useStore from "../store";
import { sortTags } from "../constants";
import TAG_GROUPS from "../constants/tags.json";

const SERVICES = ["Eyelash Extensions", "Touchup", "Mani/Pedi", "Lash Lift"];

export default function ManualEntry({ onClose }) {
  const { appointments, createRecord, fetchAppointments, showToast } = useStore();
  const [form, setForm] = useState({
    customerName: "",
    mobileNumber: "",
    service: SERVICES[0],
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    amount: "",
    tags: [],
    customTags: [],
    customTag: "",
  });

  useEffect(() => { fetchAppointments(); }, []);

  const handleSubmit = async () => {
    if (!form.customerName.trim()) {
      showToast("Customer name is required");
      return;
    }
    const [h, m] = form.time.split(":").map(Number);
    try {
      await createRecord({
        customerName: form.customerName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        service: form.service,
        date: form.date,
        timeMinutes: h * 60 + m,
        amount: form.amount || 0,
        tags: sortTags([...form.tags, ...form.customTags]),
      });
      showToast("Record created");
      onClose();
    } catch {
      showToast("Failed to create record");
    }
  };

  const toggleTag = (tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));
  };

  const addCustomTag = () => {
    const t = form.customTag.trim();
    if (t) setForm((f) => ({ ...f, customTags: [...f.customTags, t], customTag: "" }));
  };

  const allTags = [...form.tags, ...form.customTags];

  const suggestions = useMemo(() => {
    const q = form.mobileNumber.replace(/[^0-9]/g, "");
    if (q.length < 4) return [];
    const seen = new Set();
    const results = [];
    for (const a of appointments) {
      const num = a.mobileNumber?.replace(/[^0-9]/g, "");
      if (!num || !num.includes(q)) continue;
      if (seen.has(num)) continue;
      seen.add(num);
      results.push(a);
      if (results.length >= 10) break;
    }
    return results;
  }, [form.mobileNumber, appointments]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-[560px] sm:rounded-xl rounded-t-2xl shadow-2xl m-4 mb-8" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 space-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-gray-900">New Record</h2>
            <button onClick={onClose} className="text-[#c7006a] hover:text-[#c7006a]/70 text-sm">Close</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input type="text" value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Jane Doe" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <div className="relative">
              <input type="tel" value={form.mobileNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-20"
                placeholder="+65 9123 4567" />
              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          customerName: a.customerName,
                          mobileNumber: a.mobileNumber,
                        }));
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#fad5da]/60 transition flex items-center justify-between"
                    >
                      <span className="text-gray-900 font-medium">{a.customerName}</span>
                      <span className="text-gray-400 text-xs">{a.mobileNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
              {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount $</label>
            <input type="number" step="0.01" min="0" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0.00" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            {Object.entries(TAG_GROUPS).map(([groupId, groupTags]) =>
              groupTags.length > 0 ? (
                <div key={groupId} className="flex flex-wrap gap-1.5 mb-1">
                  {groupTags.map((tag) => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                        form.tags.includes(tag)
                          ? "bg-[#fad5da] border-[#cfad5d] text-[#c7006a]"
                          : "bg-white border-gray-200 text-[#c7006a] hover:border-[#cfad5d]"
                      }`}>{tag}</button>
                  ))}
                </div>
              ) : <div key={groupId} className="mb-4" />
            )}
            <div className="flex gap-2 pt-2">
              <input type="text" value={form.customTag}
                onChange={(e) => setForm({ ...form, customTag: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") addCustomTag(); }}
                placeholder="Add custom tag..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <button type="button" onClick={addCustomTag}
                className="px-3 py-1.5 bg-[#fbecf5] hover:bg-[#fad5da] rounded-lg text-sm font-medium text-[#c7006a] transition">+</button>
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{tag}</span>
                ))}
                {form.customTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                    {tag}
                    <button type="button" onClick={() => setForm((f) => ({ ...f, customTags: f.customTags.filter((t) => t !== tag) }))}
                      className="text-gray-400 hover:text-gray-600 leading-none">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button onClick={handleSubmit}
              className="flex-1 bg-[#c7006a] hover:bg-[#c7006a]/80 text-white rounded-lg py-2 text-sm font-medium transition">Submit</button>
            <button onClick={onClose}
              className="flex-1 bg-white hover:bg-[#fad5da]/60 text-[#c7006a] rounded-lg py-2 text-sm font-medium border border-[#cfad5d]/20 transition">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
