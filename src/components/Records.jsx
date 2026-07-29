import React, { useMemo, useState } from "react";
import useStore from "../store";
import { minutesToTime, formatDate as fmt } from "../constants";

export default function Records({ onSelect }) {
  const { appointments, showToast } = useStore();
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
      <h2 className="text-lg font-medium text-gray-700 mb-4">Records</h2>

      {sorted.length === 0 && (
        <p className="text-gray-400 text-sm">No submitted records yet.</p>
      )}

      {sorted.length > 0 && (
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-left">
                <th className="pb-2 pr-3 font-medium">Date</th>
                <th className="pb-2 pr-3 font-medium">Time</th>
                <th className="pb-2 pr-3 font-medium">Customer</th>
                <th className="pb-2 pr-3 font-medium">Service</th>
                <th className="pb-2 pr-3 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Tags</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelect?.(r.id)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-2.5 pr-3 text-gray-700 whitespace-nowrap">{fmt(r.date)}</td>
                  <td className="py-2.5 pr-3 text-gray-700 whitespace-nowrap">{minutesToTime(r.timeMinutes)}</td>
                  <td className="py-2.5 pr-3 text-gray-900 font-medium whitespace-nowrap">{r.customerName}</td>
                  <td className="py-2.5 pr-3 text-gray-600">{r.service}</td>
                  <td className="py-2.5 pr-3 text-gray-700 text-right whitespace-nowrap">${Number(r.amount).toFixed(2)}</td>
                  <td className="py-2.5 text-gray-500 max-w-[200px] truncate">
                    {r.tags?.length ? r.tags.join(", ") : "—"}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={(e) => handleDelete(r.id, e)}
                      disabled={deleting === r.id}
                      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-40"
                    >
                      {deleting === r.id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="sm:hidden space-y-3">
          {sorted.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelect?.(r.id)}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-gray-300 transition"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium text-gray-900">{r.customerName}</span>
                <span className="text-sm text-gray-600 font-medium">${Number(r.amount).toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {fmt(r.date)} · {minutesToTime(r.timeMinutes)} · {r.service}
              </div>
              {r.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {r.tags.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={(e) => handleDelete(r.id, e)}
                disabled={deleting === r.id}
                className="mt-2 text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-40"
              >
                {deleting === r.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
