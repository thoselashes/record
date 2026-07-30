import React, { useMemo, useState } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ChartModal({ appointments, onClose }) {
  const [page, setPage] = useState(0);

  const monthly = useMemo(() => {
    const year = String(new Date().getFullYear());
    const m = {};
    for (const a of appointments) {
      if (!a.date?.startsWith(year) || !a.submitted) continue;
      const month = a.date.slice(5, 7);
      if (!m[month]) m[month] = { amount: 0, count: 0 };
      m[month].amount += Number(a.amount || 0);
      m[month].count++;
    }
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const key = String(i + 1).padStart(2, "0");
      arr.push({ month: MONTHS[i], key, amount: m[key]?.amount || 0, count: m[key]?.count || 0 });
    }
    return arr;
  }, [appointments]);

  const maxAmount = Math.max(...monthly.map((m) => m.amount), 1);
  const maxCount = Math.max(...monthly.map((m) => m.count), 1);
  const chartW = 600, chartH = 280, barW = 30, gap = 12, pad = 40;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-2" onClick={onClose}>
      <div className="bg-white w-full max-w-[560px] rounded-xl shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setPage(page > 0 ? page - 1 : 1)} className="text-gray-400 hover:text-gray-600 text-sm px-2">&larr;</button>
          <span className="text-xs text-gray-500 font-medium">{page === 0 ? "Monthly Revenue & Appointments" : "Year-to-Date Breakdown"}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
        </div>

        {page === 0 ? <BarChart monthly={monthly} maxAmount={maxAmount} maxCount={maxCount} /> : <PieChart monthly={monthly} />}

        <div className="flex justify-center gap-1.5 mt-3">
          <button onClick={() => setPage(0)} className={`w-2 h-2 rounded-full ${page === 0 ? "bg-[#c7006a]" : "bg-gray-300"}`} />
          <button onClick={() => setPage(1)} className={`w-2 h-2 rounded-full ${page === 1 ? "bg-[#c7006a]" : "bg-gray-300"}`} />
        </div>
      </div>
    </div>
  );
}

function BarChart({ monthly, maxAmount, maxCount }) {
  const pad = 40, padTop = 20, padRight = 10;
  const w = 500, h = 260;
  const innerW = w - pad - padRight;
  const innerH = h - pad - padTop;
  const step = Math.floor(innerW / 12);
  const barW = 20, gap = 6;

  const yTicks = 4;
  const tickStep = Math.ceil(maxAmount / yTicks / 100) * 100 || 100;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" style={{ maxHeight: "280px" }}>
      {/* Y axis grid lines + labels */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const val = tickStep * i;
        const y = padTop + innerH - (val / maxAmount) * innerH;
        return (
          <g key={i}>
            <line x1={pad} y1={y} x2={w - padRight} y2={y} stroke="#e5e7eb" strokeWidth={1} />
            <text x={pad - 6} y={y + 3} textAnchor="end" className="text-[10px]" fill="#9ca3af">${val}</text>
          </g>
        );
      })}
      {/* Bars */}
      {monthly.map((m, i) => {
        const cx = pad + i * step + step / 2;
        const amountH = (m.amount / maxAmount) * innerH;
        const countH = (m.count / maxCount) * innerH;
        return (
          <g key={m.key}>
            <rect x={cx - barW - gap / 2} y={padTop + innerH - amountH} width={barW} height={amountH || 0} rx={2} fill="#c7006a" />
            <rect x={cx + gap / 2} y={padTop + innerH - countH} width={barW} height={countH || 0} rx={2} fill="#cfad5d" />
            <text x={cx} y={h - 6} textAnchor="middle" className="text-[9px]" fill="#9ca3af">{m.month}</text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x={pad} y={6} width={10} height={10} rx={1} fill="#c7006a" />
      <text x={pad + 14} y={14} className="text-[10px]" fill="#6b7280">Amount</text>
      <rect x={pad + 60} y={6} width={10} height={10} rx={1} fill="#cfad5d" />
      <text x={pad + 74} y={14} className="text-[10px]" fill="#6b7280">Appointments</text>
    </svg>
  );
}

function PieChart({ monthly }) {
  const total = monthly.reduce((s, m) => s + m.amount, 0);
  if (total === 0) return <div className="text-center text-gray-400 py-16 text-sm">No data this year.</div>;

  const cx = 150, cy = 150, r = 110;
  const colors = ["#c7006a","#cfad5d","#fad5da","#fbecf5","#e8a0bf","#b8d4b0","#a0c4e8","#d4a0e8","#e8d4a0","#a0e8d4","#e8a0a0","#a0a0e8"];
  let startAngle = -90;

  const arcs = monthly.filter((m) => m.amount > 0).map((m, i) => {
    const angle = (m.amount / total) * 360;
    const endAngle = startAngle + angle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const labelAngle = startAngle + angle / 2;
    const lr = r * 0.65;
    const lx = cx + lr * Math.cos((labelAngle * Math.PI) / 180);
    const ly = cy + lr * Math.sin((labelAngle * Math.PI) / 180);
    const item = { path, color: colors[i % colors.length], label: m.month, amount: m.amount, pct: (m.amount / total * 100).toFixed(1), labelX: lx, labelY: ly, showLabel: angle > 25 };
    startAngle = endAngle;
    return item;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
      <svg viewBox="0 0 300 300" className="w-48 h-48 shrink-0">
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill={a.color} stroke="white" strokeWidth={2} />
        ))}
        {arcs.filter((a) => a.showLabel).map((a, i) => (
          <text key={i} x={a.labelX} y={a.labelY} textAnchor="middle" dominantBaseline="central" className="text-[9px]" fill="white" fontWeight="bold">{a.pct}%</text>
        ))}
      </svg>
      <div className="text-xs space-y-1">
        <div className="font-medium text-gray-700 mb-1">Total: ${total.toFixed(2)}</div>
        {arcs.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: a.color }} />
            <span className="text-gray-600">{a.label}</span>
            <span className="text-gray-400">${a.amount.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
