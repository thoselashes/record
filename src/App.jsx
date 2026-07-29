import React, { useEffect, useState } from "react";
import useStore from "./store";
import Agenda from "./components/Agenda";
import Records from "./components/Records";
import Detail from "./components/Detail";

export default function App() {
  const { fetchAppointments } = useStore();
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("agenda");

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Thoselashes</h1>
            <nav className="flex gap-1">
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
        {tab === "agenda" && <Agenda onSelect={setSelectedId} />}
        {tab === "records" && <Records onSelect={setSelectedId} />}
        <Detail selectedId={selectedId} onClose={() => setSelectedId(null)} />
      </main>
    </div>
  );
}
