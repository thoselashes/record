import React, { useMemo, useState, useEffect } from "react";
import useStore from "../store";
import { minutesToTime, formatDate } from "../constants";

const STORAGE_KEY = "thoselashes-agenda-date";

function firstName(name) {
  return name.split(/[\s-]/)[0];
}

export default function Agenda({ onSelect }) {
  const { appointments } = useStore();
  const [dayIdx, setDayIdx] = useState(0);

  const sortedDates = useMemo(() => {
    const set = new Set();
    for (const a of appointments) set.add(a.date);
    return [...set].sort();
  }, [appointments]);

  const allDays = useMemo(() => {
    if (sortedDates.length === 0) return [];
    const start = new Date(sortedDates[0]);
    const end = new Date(sortedDates[sortedDates.length - 1]);
    const days = [];
    const cur = new Date(start);
    while (cur <= end) {
      days.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [sortedDates]);

  // Persist last-viewed date
  useEffect(() => {
    if (allDays.length === 0) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const idx = allDays.indexOf(saved);
      if (idx >= 0) {
        setDayIdx(idx);
        return;
      }
    }
    // No saved date — default to today
    const today = new Date().toISOString().slice(0, 10);
    const idx = allDays.indexOf(today);
    setDayIdx(idx >= 0 ? idx : 0);
  }, [allDays]);

  // Save current date when user navigates
  useEffect(() => {
    if (allDays[dayIdx]) {
      localStorage.setItem(STORAGE_KEY, allDays[dayIdx]);
    }
  }, [dayIdx, allDays]);

  // Clamp when allDays shrinks
  useEffect(() => {
    setDayIdx((prev) => Math.max(0, Math.min(prev, allDays.length - 1)));
  }, [allDays.length]);

  const currentDate = allDays[dayIdx] ?? null;
  const apps = currentDate
    ? appointments
        .filter((a) => a.date === currentDate)
        .sort((a, b) => a.timeMinutes - b.timeMinutes)
    : [];

  const handleDateSelect = (e) => {
    const idx = allDays.indexOf(e.target.value);
    if (idx >= 0) setDayIdx(idx);
  };

  const goToday = () => {
    const idx = allDays.indexOf(todayStr());
    setDayIdx(idx >= 0 ? idx : 0);
  };

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setDayIdx(dayIdx - 1)}
          disabled={dayIdx <= 0}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[#cfad5d]/20 bg-white text-[#c7006a] hover:bg-[#fad5da]/60 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ← Prev
        </button>
        <div className="relative inline-block cursor-pointer" onClick={() => document.getElementById("agenda-date-input")?.showPicker?.()}>
          <input
            id="agenda-date-input"
            type="date"
            value={currentDate ?? ""}
            onChange={handleDateSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <span className="text-sm font-semibold text-gray-700 hover:text-[#c7006a] transition pr-5">
            {currentDate ? formatDate(currentDate) : "No date"}
          </span>
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none text-xs">▾</span>
        </div>
        <button
          type="button"
          onClick={() => setDayIdx(dayIdx + 1)}
          disabled={dayIdx >= allDays.length - 1}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[#cfad5d]/20 bg-white text-[#c7006a] hover:bg-[#fad5da]/60 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next →
        </button>
      </div>

      {currentDate && currentDate !== todayStr() && (
        <div className="text-center mb-3">
          <button onClick={() => goToday()} className="text-xs text-[#c7006a] hover:text-[#c7006a]/70 underline underline-offset-2 transition">
            &larr; Back to today
          </button>
        </div>
      )}

      {allDays.length === 0 ? (
        <p className="text-gray-400 text-center">No appointments.</p>
      ) : apps.length === 0 ? (
        <p className="text-gray-400 text-center">No appointments on this day.</p>
      ) : (
        <AppointmentList apps={apps} onSelect={onSelect} />
      )}
    </section>
  );
}

function AppointmentList({ apps, onSelect }) {
  return (
    <div className="space-y-2">
      {apps.map((app) => (
        <button
          key={app.id}
          onClick={() => onSelect(app.id)}
          className="w-full text-left bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 hover:shadow-sm transition cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <span className="font-display font-medium text-gray-900 truncate mr-2">
              {firstName(app.customerName)}
            </span>
            <span className="text-sm text-gray-500 shrink-0">
              {minutesToTime(app.timeMinutes)}
            </span>
          </div>
          <div className="text-sm text-[#c7006a] mt-0.5 italic">
            {app.service}
          </div>
          {app.submitted && app.amount > 0 && (
            <div className="text-xs font-medium text-green-600 mt-1">
              Paid ${Number(app.amount).toFixed(2)}
            </div>
          )}
          {app.submitted && !(app.amount > 0) && (
            <div className="text-xs text-gray-400 mt-1">Pending</div>
          )}
        </button>
      ))}
    </div>
  );
}
