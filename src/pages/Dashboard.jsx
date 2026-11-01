import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Radio, CheckCircle, Users, Wrench, ArrowRight,
  AlertTriangle, FileBarChart2, UserPlus, RotateCcw
} from 'lucide-react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';

const COLORS = ['#22c55e', '#3b82f6', '#ef4444'];

function StatCard({ icon: Icon, color, label, value, sub, onClick }) {
  return (
    <div className="stat-card cursor-pointer" onClick={onClick}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white font-bold text-2xl">{value}</p>
        {sub && <p className="text-gray-500 text-xs truncate">{sub}</p>}
      </div>
      <ArrowRight size={16} className="text-gray-600" />
    </div>
  );
}

function ActivityBadge({ type }) {
  const map = {
    Issue: 'badge-issued',
    Return: 'badge-returned',
    Register: 'badge-available',
    Maintenance: 'badge-maintenance',
  };
  return <span className={map[type] || 'badge-available'}>{type}</span>;
}

export default function Dashboard() {
  const { radios, soldiers, transactions } = useStore();
  const navigate = useNavigate();

  const available = radios.filter((r) => r.status === 'Available').length;
  const issued = radios.filter((r) => r.status === 'Issued').length;
  const maintenance = radios.filter((r) => r.status === 'Under Maintenance').length;
  const total = radios.length;

  const pieData = [
    { name: 'Available', value: available },
    { name: 'Issued', value: issued },
    { name: 'Under Maintenance', value: maintenance },
  ];

  // Radios due for return (issued > 1 day)
  const overdueRadios = radios
    .filter((r) => r.status === 'Issued' && r.issuedDate)
    .map((r) => {
      const days = differenceInDays(new Date(), new Date(r.issuedDate));
      const soldier = soldiers.find((s) => s.id === r.issuedTo);
      return { ...r, daysOverdue: days, soldierName: soldier?.name || 'Unknown' };
    })
    .filter((r) => r.daysOverdue >= 1)
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 5);

  const recentTx = transactions.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d2610 0%, #14532d 60%, #0a1f0a 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-gray-300 text-sm">Welcome Back,</p>
          <h1 className="text-white font-extrabold text-2xl">2LT RO ADAMS</h1>
          <p className="text-army-light text-sm">Radio Asset Management System (RAMS)</p>
          <div className="flex gap-4 mt-3">
            {['Accountability', 'Discipline', 'Operational Readiness'].map((t) => (
              <span key={t} className="text-gray-400 text-xs border border-green-900 rounded px-2 py-0.5">{t}</span>
            ))}
          </div>
        </div>
        <div className="absolute right-6 top-4 text-gray-600 opacity-30">
          <Radio size={80} />
        </div>
        <blockquote className="absolute right-6 bottom-4 text-right max-w-xs hidden md:block">
          <p className="text-gray-300 text-xs italic">"Signals keep the Army connected, informed and ready."</p>
          <p className="text-gray-500 text-[10px] mt-1">— NIGERIAN ARMY SIGNALS CORPS</p>
        </blockquote>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Radio} color="bg-gray-700" label="Total Radios" value={total} sub="All registered radios" onClick={() => navigate('/radio-register')} />
        <StatCard icon={CheckCircle} color="bg-green-700" label="Available" value={available} sub="Ready for issue" onClick={() => navigate('/radio-register')} />
        <StatCard icon={Users} color="bg-blue-700" label="Issued" value={issued} sub="Currently out" onClick={() => navigate('/radio-register')} />
        <StatCard icon={Wrench} color="bg-red-700" label="Under Maintenance" value={maintenance} sub="Needs attention" onClick={() => navigate('/radio-register')} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Recent Activities</h2>
              <button onClick={() => navigate('/transactions')} className="text-army-light text-xs hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-[#0d2610] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-army flex items-center justify-center">
                      {tx.type === 'Issue' ? <Radio size={14} className="text-white" /> :
                       tx.type === 'Return' ? <RotateCcw size={14} className="text-white" /> :
                       <UserPlus size={14} className="text-white" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {tx.type === 'Issue' ? `Radio issued to ${tx.soldierName} (${tx.soldierArmyNo})` :
                         tx.type === 'Return' ? `Radio returned by ${tx.soldierName} (${tx.soldierArmyNo})` :
                         `New soldier registered: ${tx.soldierName} (${tx.soldierArmyNo})`}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {tx.radioSerial && `${tx.radioSerial} · `}
                        {format(new Date(tx.timestamp), 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <ActivityBadge type={tx.type} />
                </div>
              ))}
            </div>
          </div>

          {/* Radio Status Overview */}
          <div className="card">
            <h2 className="text-white font-semibold mb-4">Radio Status Overview</h2>
            <div className="flex items-center gap-8">
              <div className="w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" stroke="none">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -ml-4">
                <p className="text-white font-bold text-xl">{total}</p>
                <p className="text-gray-400 text-xs">Total Radios</p>
              </div>
              <div className="flex-1 space-y-3">
                {[
                  { label: 'Available', value: available, pct: total ? ((available / total) * 100).toFixed(1) : 0, color: 'bg-green-500' },
                  { label: 'Issued', value: issued, pct: total ? ((issued / total) * 100).toFixed(1) : 0, color: 'bg-blue-500' },
                  { label: 'Under Maintenance', value: maintenance, pct: total ? ((maintenance / total) * 100).toFixed(1) : 0, color: 'bg-red-500' },
                ].map(({ label, value, pct, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                    <span className="text-gray-300 text-sm flex-1">{label}</span>
                    <span className="text-white font-semibold text-sm w-6 text-right">{value}</span>
                    <span className="text-gray-500 text-xs w-12 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button onClick={() => navigate('/issue-radio')} className="w-full btn-primary justify-between">
                <span className="flex items-center gap-2"><Radio size={16} /> Issue Radio</span>
                <ArrowRight size={14} />
              </button>
              <button onClick={() => navigate('/return-radio')} className="w-full btn-blue justify-between">
                <span className="flex items-center gap-2"><RotateCcw size={16} /> Return Radio</span>
                <ArrowRight size={14} />
              </button>
              <button onClick={() => navigate('/soldier-register')} className="w-full btn-secondary justify-between">
                <span className="flex items-center gap-2"><UserPlus size={16} /> Add Soldier</span>
                <ArrowRight size={14} />
              </button>
              <button onClick={() => navigate('/reports')} className="w-full border border-gray-700 text-gray-300 hover:bg-[#1a2e1a] py-2.5 px-4 rounded-lg transition-colors flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><FileBarChart2 size={16} /> View Reports</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Overdue Returns */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <h2 className="text-white font-semibold">Radios Due for Return</h2>
              </div>
              <button onClick={() => navigate('/radio-register')} className="text-army-light text-xs hover:underline">View All</button>
            </div>
            {overdueRadios.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No overdue radios</p>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-3 text-gray-500 text-xs font-semibold uppercase px-2 mb-2">
                  <span>Radio No.</span>
                  <span>Soldier</span>
                  <span className="text-right">Overdue</span>
                </div>
                {overdueRadios.map((r) => (
                  <div key={r.id} className="grid grid-cols-3 px-2 py-1.5 rounded hover:bg-[#1a2e1a]">
                    <span className="text-white text-xs font-mono">{r.serialNo}</span>
                    <span className="text-gray-300 text-xs truncate">{r.soldierName.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="text-red-400 text-xs text-right font-semibold">{r.daysOverdue}d</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="card">
            <h2 className="text-white font-semibold mb-4">Quick Links</h2>
            <div className="space-y-2">
              {[
                { label: 'Radio Register', sub: 'View all radios and their status', icon: Radio, to: '/radio-register' },
                { label: 'Soldier Register', sub: 'Manage soldier information', icon: Users, to: '/soldier-register' },
                { label: 'Transactions History', sub: 'View all issue and return logs', icon: CheckCircle, to: '/transactions' },
                { label: 'Reports', sub: 'Generate and download reports', icon: FileBarChart2, to: '/reports' },
              ].map(({ label, sub, icon: Icon, to }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#1a2e1a] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded bg-[#1a2e1a] border border-green-900 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-army-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium">{label}</p>
                    <p className="text-gray-500 text-[10px] truncate">{sub}</p>
                  </div>
                  <ArrowRight size={12} className="text-gray-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
