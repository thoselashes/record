import React, { useMemo, useState, useEffect } from "react";
import useStore from "../store";
import { minutesToTime, formatDate } from "../constants";

function firstName(name) {
  return name.split(/[\s-]/)[0];
}

export default function Agenda({ onSelect, forceToday }) {
  const { appointments } = useStore();
  const [dayIdx, setDayIdx] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const { dateList, groups } = useMemo(() => {
    const map = {};
    for (const a of appointments) {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    }
    const dates = Object.keys(map).sort();
    const sorted = {};
    for (const [date, apps] of Object.entries(map)) {
      sorted[date] = [...apps].sort((a, b) => a.timeMinutes - b.timeMinutes);
    }
    return { dateList: dates, groups: sorted };
  }, [appointments]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const idx = dateList.indexOf(today);
    setDayIdx(idx);
  }, [forceToday, dateList]);

  // Clamp dayIdx when dateList shrinks (e.g. delete last record on a day)
  useEffect(() => {
    setDayIdx((prev) => Math.max(0, Math.min(prev, dateList.length - 1)));
  }, [dateList.length]);

  const currentDate = dateList[dayIdx] ?? null;
  const apps = currentDate ? (groups[currentDate] || []) : [];
  const hasRecords = dateList.length > 0;

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
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="text-sm font-semibold text-gray-700 hover:text-[#c7006a] transition"
        >
          {currentDate ? formatDate(currentDate) : "No date"}
        </button>
        <button
          type="button"
          onClick={() => setDayIdx(dayIdx + 1)}
          disabled={dayIdx >= dateList.length - 1}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[#cfad5d]/20 bg-white text-[#c7006a] hover:bg-[#fad5da]/60 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next →
        </button>
      </div>

      {showPicker && (
        <div className="mb-4 flex justify-center">
          <input
            type="date"
            value={currentDate ?? ""}
            onChange={(e) => {
              const idx = dateList.indexOf(e.target.value);
              if (idx >= 0) setDayIdx(idx);
              setShowPicker(false);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {!hasRecords && <p className="text-gray-400 text-sm">No appointments.</p>}

      {hasRecords && apps.length === 0 && (
        <p className="text-gray-400 text-sm">No appointments on this day.</p>
      )}

      {hasRecords && apps.length > 0 && (
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
