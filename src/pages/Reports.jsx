import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileBarChart2, Download, Radio, Users, TrendingUp } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export default function Reports() {
  const { radios, soldiers, transactions } = useStore();

  // Radios by type
  const radioTypes = radios.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  const radioTypeData = Object.entries(radioTypes).map(([name, count]) => ({ name, count }));

  // Activity over last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStr = format(day, 'dd MMM');
    const count = transactions.filter((t) => format(new Date(t.timestamp), 'dd MMM') === dayStr).length;
    return { name: dayStr, count };
  });

  // Summary stats
  const totalIssued = transactions.filter((t) => t.type === 'Issue').length;
  const totalReturned = transactions.filter((t) => t.type === 'Return').length;

  const exportFullReport = () => {
    const lines = [
      '=== RAMS FULL REPORT ===',
      `Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`,
      '',
      '--- RADIO SUMMARY ---',
      `Total Radios: ${radios.length}`,
      `Available: ${radios.filter(r => r.status === 'Available').length}`,
      `Issued: ${radios.filter(r => r.status === 'Issued').length}`,
      `Under Maintenance: ${radios.filter(r => r.status === 'Under Maintenance').length}`,
      '',
      '--- SOLDIER SUMMARY ---',
      `Total Registered: ${soldiers.length}`,
      '',
      '--- TRANSACTION SUMMARY ---',
      `Total Issues: ${totalIssued}`,
      `Total Returns: ${totalReturned}`,
      '',
      '--- RADIO REGISTER ---',
      'Serial No,Type,Frequency,Condition,Status,Issued To',
      ...radios.map((r) => {
        const s = r.issuedTo ? soldiers.find((sol) => sol.id === r.issuedTo) : null;
        return `${r.serialNo},${r.type},${r.frequency},${r.condition},${r.status},${s?.name || ''}`;
      }),
      '',
      '--- TRANSACTION LOG ---',
      'Date & Time,Soldier,Army No,Radio,Action,Processed By',
      ...transactions.map((t) =>
        `${format(new Date(t.timestamp), 'dd/MM/yyyy HH:mm')},"${t.soldierName}",${t.soldierArmyNo},${t.radioSerial || ''},${t.type},"${t.processedBy}"`
      ),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `RAMS-Report-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
  };

  const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <FileBarChart2 size={24} className="text-army-light" /> Reports
          </h1>
          <p className="text-gray-400 text-sm">Generate and download operational reports</p>
        </div>
        <button onClick={exportFullReport} className="btn-primary">
          <Download size={16} /> Download Full Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Radios', value: radios.length, icon: Radio, color: 'text-army-light' },
          { label: 'Total Soldiers', value: soldiers.length, icon: Users, color: 'text-blue-400' },
          { label: 'Total Issues', value: totalIssued, icon: TrendingUp, color: 'text-yellow-400' },
          { label: 'Total Returns', value: totalReturned, icon: TrendingUp, color: 'text-green-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <Icon size={28} className={color} />
            <div>
              <p className="text-gray-400 text-xs">{label}</p>
              <p className="text-white font-bold text-2xl">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity last 7 days */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4">Activity – Last 7 Days</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radios by Type */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4">Radios by Type</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={radioTypeData} layout="vertical">
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {radioTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Overdue radios table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Currently Issued Radios</h2>
          <span className="badge-issued">{radios.filter(r => r.status === 'Issued').length} Active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Radio Serial', 'Type', 'Soldier', 'Army No.', 'Issued Date', 'Days Out'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {radios.filter(r => r.status === 'Issued').map((r) => {
                const s = soldiers.find((sol) => sol.id === r.issuedTo);
                const days = r.issuedDate ? Math.floor((Date.now() - new Date(r.issuedDate).getTime()) / 86400000) : 0;
                return (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell text-army-light font-mono">{r.serialNo}</td>
                    <td className="table-cell text-gray-300">{r.type}</td>
                    <td className="table-cell text-white">{s?.name || '—'}</td>
                    <td className="table-cell text-gray-300 font-mono text-xs">{s?.armyNo || '—'}</td>
                    <td className="table-cell text-gray-300">{r.issuedDate ? format(new Date(r.issuedDate), 'dd MMM yyyy') : '—'}</td>
                    <td className="table-cell">
                      <span className={days > 1 ? 'text-red-400 font-semibold' : 'text-gray-300'}>{days}d</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
