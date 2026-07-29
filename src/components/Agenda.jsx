import React, { useMemo, useState, useEffect } from "react";
import useStore from "../store";
import { minutesToTime, formatDate } from "../constants";

function firstName(name) {
  return name.split(/[\s-]/)[0];
}

export default function Agenda({ onSelect }) {
  const { appointments } = useStore();
  const [dayIdx, setDayIdx] = useState(0);

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
    if (dateList.length) {
      const today = new Date().toISOString().slice(0, 10);
      const idx = dateList.indexOf(today);
      setDayIdx(idx >= 0 ? idx : dateList.length - 1);
    }
  }, [dateList]);

  const currentDate = dateList[dayIdx];
  const apps = currentDate ? groups[currentDate] : [];

  return (
    <section>
      {dateList.length === 0 && (
        <p className="text-gray-400 text-sm">No appointments.</p>
      )}

      {currentDate && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setDayIdx(dayIdx - 1)}
              disabled={dayIdx <= 0}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[#cfad5d]/20 bg-white text-[#c7006a] hover:bg-[#fad5da]/60 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {formatDate(currentDate)}
            </span>
            <button
              type="button"
              onClick={() => setDayIdx(dayIdx + 1)}
              disabled={dayIdx >= dateList.length - 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[#cfad5d]/20 bg-white text-[#c7006a] hover:bg-[#fad5da]/60 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
          <AppointmentList apps={apps} onSelect={onSelect} />
        </div>
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
            <span className="font-medium text-gray-900 truncate mr-2">
              {firstName(app.customerName)}
            </span>
            <span className="text-sm text-gray-500 shrink-0">
              {minutesToTime(app.timeMinutes)}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-0.5">
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
