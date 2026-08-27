'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Ene', MRR: 28000 },
  { name: 'Feb', MRR: 31000 },
  { name: 'Mar', MRR: 33500 },
  { name: 'Abr', MRR: 36000 },
  { name: 'May', MRR: 38200 },
  { name: 'Jun', MRR: 42500 },
];

export default function MRRChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value/1000}k`} />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'MRR']}
          />
          <Bar dataKey="MRR" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
