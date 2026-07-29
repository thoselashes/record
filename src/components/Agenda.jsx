import React, { useMemo, useState } from "react";
import useStore from "../store";
import { minutesToTime, formatDate } from "../constants";

function firstName(name) {
  return name.split(/[\s-]/)[0];
}

export default function Agenda({ onSelect }) {
  const { appointments } = useStore();
  const [showHistory, setShowHistory] = useState(false);
  const [historyIdx, setHistoryIdx] = useState(0);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const { todayUpcoming, historyDays } = useMemo(() => {
    const today = [];

    for (const a of appointments) {
      if (!a.submitted && a.date >= todayStr) {
        today.push(a);
      }
    }

    // Build history: submitted today + all past dates
    const histMap = {};
    for (const a of appointments) {
      if (a.submitted || a.date < todayStr) {
        if (!histMap[a.date]) histMap[a.date] = [];
        histMap[a.date].push(a);
      }
    }

    // Sort history dates newest first
    const historyDays = Object.entries(histMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, apps]) => [date, [...apps].sort((a, b) => a.timeMinutes - b.timeMinutes)]);

    return {
      todayUpcoming: (() => {
        const map = {};
        for (const a of today) {
          if (!map[a.date]) map[a.date] = [];
          map[a.date].push(a);
        }
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
      })(),
      historyDays,
    };
  }, [appointments, todayStr]);

  const currentDay = historyDays[historyIdx];
  const canPrev = historyIdx < historyDays.length - 1;
  const canNext = historyIdx > 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-gray-700">
          {showHistory ? "History" : "Today's Appointments"}
        </h2>
        {historyDays.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowHistory(!showHistory);
              if (showHistory) setHistoryIdx(0);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showHistory ? "Back to Today" : "Show History"}
          </button>
        )}
      </div>

      {!showHistory && (
        <>
          {!todayUpcoming.length && (
            <p className="text-gray-400 text-sm">No active appointments.</p>
          )}
          {todayUpcoming.map(([date, apps]) => (
            <DateGroup
              key={date}
              label={date === todayStr ? "Today" : formatDate(date)}
              apps={apps}
              onSelect={onSelect}
            />
          ))}
        </>
      )}

      {showHistory && (
        <>
          {!currentDay && (
            <p className="text-gray-400 text-sm">No historical appointments.</p>
          )}
          {currentDay && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setHistoryIdx(historyIdx + 1)}
                  disabled={!canPrev}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ← Prev Day
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  {currentDay[0] === todayStr ? "Today" : formatDate(currentDay[0])}
                </span>
                <button
                  type="button"
                  onClick={() => setHistoryIdx(historyIdx - 1)}
                  disabled={!canNext}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Next Day →
                </button>
              </div>
              <AppointmentList apps={currentDay[1]} onSelect={onSelect} />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function DateGroup({ label, apps, onSelect }) {
  const sorted = [...apps].sort((a, b) => a.timeMinutes - b.timeMinutes);
  return (
    <div className="mb-6">
      <h3 className={`text-sm font-medium mb-2 ${label === "Today" ? "text-blue-600" : "text-gray-500"}`}>
        {label}
      </h3>
      <AppointmentList apps={sorted} onSelect={onSelect} />
    </div>
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
