import React from 'react';

export function Metric({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-3xl font-extrabold text-white">{value}</span>
      </div>
      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}
