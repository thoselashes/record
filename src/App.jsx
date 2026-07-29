import React, { useEffect, useState } from "react";
import useStore from "./store";
import Agenda from "./components/Agenda";
import Records from "./components/Records";
import Detail from "./components/Detail";

export default function App() {
  const { fetchAppointments, toast, clearToast } = useStore();
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("agenda");
  const [todayTick, setTodayTick] = useState(0);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(clearToast, 2500);
      return () => clearTimeout(t);
    }
  }, [toast, clearToast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Thoselashes</h1>
            <nav className="flex gap-1">
              {tab === "agenda" && (
                <button
                  type="button"
                  onClick={() => setTodayTick((t) => t + 1)}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg text-blue-600 hover:bg-blue-50 transition"
                >
                  Today
                </button>
              )}
              <button
                type="button"
                onClick={() => setTab("agenda")}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  tab === "agenda"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Agenda
              </button>
              <button
                type="button"
                onClick={() => setTab("records")}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  tab === "records"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Records
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4">
        {tab === "agenda" && <Agenda onSelect={setSelectedId} todayTick={todayTick} />}
        {tab === "records" && <Records onSelect={setSelectedId} />}
        <Detail selectedId={selectedId} onClose={() => setSelectedId(null)} />
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg transition">
          {toast}
        </div>
      )}
    </div>
  );
}
