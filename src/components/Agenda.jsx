import React, { useMemo } from "react";
import useStore from "../store";
import { minutesToTime, formatDate } from "../constants";

function firstName(name) {
  return name.split(/[\s-]/)[0];
}

function groupByDate(list) {
  const map = {};
  for (const a of list) {
    if (!map[a.date]) map[a.date] = [];
    map[a.date].push(a);
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

export default function Agenda({ onSelect }) {
  const { appointments } = useStore();

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const groups = useMemo(() => {
    const active = appointments.filter((a) => !a.submitted);
    const upcoming = active.filter((a) => a.date >= todayStr);
    return groupByDate(upcoming);
  }, [appointments, todayStr]);

  return (
    <section>
      <h2 className="text-lg font-medium text-gray-700 mb-3">Today's Appointments</h2>

      {!groups.length && (
        <p className="text-gray-400 text-sm">No active appointments.</p>
      )}

      {groups.map(([date, apps]) => (
        <DateGroup
          key={date}
          label={date === todayStr ? "Today" : formatDate(date)}
          apps={apps}
          onSelect={onSelect}
        />
      ))}
    </section>
  );
}

function DateGroup({ label, apps, onSelect }) {
  return (
    <div className="mb-6">
      <h3 className={`text-sm font-medium mb-2 ${label === "Today" ? "text-blue-600" : "text-gray-500"}`}>
        {label}
      </h3>
      <AppointmentList apps={apps} onSelect={onSelect} />
    </div>
  );
}

function AppointmentList({ apps, onSelect }) {
  const sorted = [...apps].sort((a, b) => a.timeMinutes - b.timeMinutes);
  return (
    <div className="space-y-2">
      {sorted.map((app) => (
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
        </button>
      ))}
    </div>
  );
}
