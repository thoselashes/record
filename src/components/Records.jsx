import React, { useMemo, useState } from "react";
import useStore from "../store";
import { minutesToTime } from "../constants";
import ManualEntry from "./ManualEntry";
import ChartModal from "./ChartModal";

function weekStart(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const diff = d.getDate() - ((d.getDay() + 6) % 7);
  d.setDate(diff);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function dayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function monthName(iso) {
  return new Date(iso + "-01T00:00:00").toLocaleString("default", { month: "long" });
}

export default function Records({ onSelect }) {
  const { appointments, showToast } = useStore();
  const [showEntry, setShowEntry] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const sorted = useMemo(
    () =>
      [...appointments]
        .filter((a) => a.submitted)
        .sort((a, b) => {
          const da = a.date + String(a.timeMinutes).padStart(5, "0");
          const db = b.date + String(b.timeMinutes).padStart(5, "0");
          return db.localeCompare(da);
        }),
    [appointments]
  );

  const { groups, yearTotal, yearCount, monthTotal, monthCount } = useMemo(() => {
    const now = new Date();
    const yearStr = String(now.getFullYear());
    const monthStr = now.toISOString().slice(0, 7);

    let yearTotal = 0, yearCount = 0, monthTotal = 0, monthCount = 0;

    // Group ALL appointments by week then by day
    const raw = {};
    const weekMeta = {};
    const dayMeta = {};
    for (const a of appointments) {
      if (!a.date) continue;
      const ws = weekStart(a.date);
      if (!raw[ws]) raw[ws] = {};
      if (!raw[ws][a.date]) raw[ws][a.date] = [];
      raw[ws][a.date].push(a);

      // Week totals
      if (!weekMeta[ws]) weekMeta[ws] = { amount: 0, submitted: 0, total: 0 };
      weekMeta[ws].total++;
      if (a.submitted) { weekMeta[ws].amount += Number(a.amount || 0); weekMeta[ws].submitted++; }

      // Day totals
      if (!dayMeta[a.date]) dayMeta[a.date] = { amount: 0, submitted: 0, total: 0 };
      dayMeta[a.date].total++;
      if (a.submitted) { dayMeta[a.date].amount += Number(a.amount || 0); dayMeta[a.date].submitted++; }

      // Dashboard year/month
      if (a.date.startsWith(yearStr)) {
        if (a.submitted) yearTotal += Number(a.amount || 0);
        yearCount++;
      }
      if (a.date.startsWith(monthStr)) {
        if (a.submitted) monthTotal += Number(a.amount || 0);
        monthCount++;
      }
    }

    const groups = Object.entries(raw)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([ws, days]) => ({
        weekStart: ws,
        meta: weekMeta[ws] || { amount: 0, submitted: 0, total: 0 },
        days: Object.entries(days)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, records]) => ({
            date,
            records: records.filter((r) => r.submitted).sort((a, b) => a.timeMinutes - b.timeMinutes),
            meta: dayMeta[date] || { amount: 0, submitted: 0, total: 0 },
          }))
          .filter((d) => d.records.length > 0),
      }))
      .filter((w) => w.days.length > 0);

    return { groups, yearTotal, yearCount, monthTotal, monthCount };
  }, [appointments]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this record?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await useStore.getState().fetchAppointments();
      showToast("Deleted");
    } catch {
      showToast("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-700">Records</h2>
        <button
          type="button"
          onClick={() => setShowEntry(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#c7006a] text-white text-lg font-medium hover:bg-[#c7006a]/80 transition"
        >
          +
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-gray-400 text-sm">No submitted records yet.</p>
      ) : (
        <>
          {/* Dashboard */}
          <div className="mb-4 bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm cursor-pointer hover:border-[#cfad5d]/40 transition" onClick={() => setShowCharts(true)}>
            <div className="font-medium text-green-600">
              This Year: <span className="font-bold">${yearTotal.toFixed(2)}</span>
              <span className="text-gray-500 font-normal"> &nbsp;| {yearCount} appt{yearCount !== 1 ? "s" : ""}</span>
            </div>
            <div className="font-medium text-green-600 mt-0.5">
              Total in {monthName(new Date().toISOString().slice(0, 7))}: <span className="font-bold">${monthTotal.toFixed(2)}</span>
              <span className="text-gray-500 font-normal"> &nbsp;| {monthCount} appt{monthCount !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Grouped records */}
          <div className="space-y-6">
            {groups.map(({ weekStart: ws, days, meta: weekMeta }) => {
              return (
                <div key={ws}>
                  <div className="flex items-baseline justify-between mb-2 pb-1 border-b border-gray-200">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Week of {dayLabel(ws)}
                    </span>
                    <span className="text-xs text-green-600 font-semibold">
                      ${weekMeta.amount.toFixed(2)} ({weekMeta.submitted}/{weekMeta.total})
                    </span>
                  </div>
                  <div className="space-y-4">
                    {days.map(({ date, records, meta: dayMeta }) => (
                      <div key={date}>
                        <div className="flex items-baseline justify-between mb-1.5 ml-1">
                          <span className="text-xs font-medium text-gray-400">{dayLabel(date)}</span>
                          <span className="text-xs text-green-600 font-semibold">
                            ${dayMeta.amount.toFixed(2)} ({dayMeta.submitted}/{dayMeta.total})
                          </span>
                        </div>
                        <div className="bg-[#fbecf5] rounded-lg border border-[#cfad5d]/30 px-3 py-2 space-y-1.5">
                          {records.map((r) => (
                            <div
                              key={r.id}
                              onClick={() => onSelect?.(r.id)}
                              className="bg-white rounded-lg border border-[#cfad5d]/30 px-3 py-2 cursor-pointer hover:border-[#cfad5d]/60 transition flex items-center gap-3"
                            >
                              <span className="text-sm text-gray-500 shrink-0 w-12 tabular-nums">{minutesToTime(r.timeMinutes)}</span>
                              <span className="text-sm font-display font-medium text-gray-900 shrink-0 min-w-0 truncate flex-1">{r.customerName}</span>
                              <div className="hidden sm:block text-right">
                                <div className="text-xs text-[#c7006a] italic truncate max-w-[120px]">{r.service}</div>
                                {r.tags?.length > 0 && (
                                  <div className="text-xs text-gray-400 truncate max-w-[120px]">{r.tags.slice(0, 2).join(", ")}{r.tags.length > 2 ? "…" : ""}</div>
                                )}
                              </div>
                              <span className="text-sm text-gray-700 font-medium shrink-0">${Number(r.amount).toFixed(2)}</span>
                              <button
                                onClick={(e) => handleDelete(r.id, e)}
                                disabled={deleting === r.id}
                                className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs font-medium disabled:opacity-40 px-1.5 py-1 rounded"
                              >
                                {deleting === r.id ? "…" : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showEntry && <ManualEntry onClose={() => setShowEntry(false)} />}
      {showCharts && <ChartModal appointments={appointments} onClose={() => setShowCharts(false)} />}
    </section>
  );
}
