import React, { useEffect, useState } from "react";
import useStore from "./store";
import Agenda from "./components/Agenda";
import Records from "./components/Records";
import Detail from "./components/Detail";

export default function App() {
  const { fetchAppointments, toast, clearToast } = useStore();
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("agenda");
  const [todayReset, setTodayReset] = useState(0);

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
      <header className="bg-[#fbecf5] shadow-sm h-[min(10vh,150px)]">
        <div className="px-4 h-full md:max-w-[600px] mx-auto">
          <div className="flex items-center justify-between h-full">
            <img src="/thoselashes-logo.png" alt="Thoselashes" className="h-full max-h-full w-auto object-contain py-2" />
            <nav className="flex gap-1">
              <button
                type="button"
                onClick={() => { setTodayReset((v) => v + 1); setTab("agenda"); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  tab === "agenda"
                    ? "bg-[#fad5da] text-[#c7006a] ring-1 ring-[#cfad5d]/40"
                    : "text-[#c7006a] hover:bg-[#fad5da]/60"
                }`}
              >
                Agenda
              </button>
              <button
                type="button"
                onClick={() => setTab("records")}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  tab === "records"
                    ? "bg-[#fad5da] text-[#c7006a] ring-1 ring-[#cfad5d]/40"
                    : "text-[#c7006a] hover:bg-[#fad5da]/60"
                }`}
              >
                Records
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="md:max-w-[600px] mx-auto px-4 py-4">
        {tab === "agenda" && <Agenda onSelect={setSelectedId} forceToday={todayReset} />}
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
