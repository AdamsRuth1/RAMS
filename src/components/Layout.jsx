import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard, Radio, RotateCcw, BookOpen,
  Users, History, FileBarChart2, Settings, LogOut,
  Bell, ChevronDown, Wifi
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/issue-radio', icon: Radio, label: 'Issue / Register Radio' },
  { to: '/return-radio', icon: RotateCcw, label: 'Return Radio' },
  { to: '/radio-register', icon: BookOpen, label: 'Radio Register' },
  { to: '/soldier-register', icon: Users, label: 'Soldier Register' },
  { to: '/transactions', icon: History, label: 'Transactions History' },
  { to: '/reports', icon: FileBarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { user, logout, transactions } = useStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const recentCount = transactions.filter(
    (t) => new Date(t.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-army-darkest">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-army-sidebar transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        } border-r border-green-900/40 flex-shrink-0`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b border-green-900/40 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-red-700 border-2 border-gold flex items-center justify-center flex-shrink-0">
            <Wifi size={18} className="text-gold" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-bold text-xs leading-tight">NIGERIAN ARMY</p>
              <p className="text-gold text-xs font-semibold">SIGNALS CORPS</p>
              <p className="text-gray-400 text-[9px]">Communications · Information · Victory</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className={`p-3 border-t border-green-900/40 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-army-medium flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-gray-400 text-[10px]">{user.role}</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-army-medium flex items-center justify-center text-white font-bold text-sm">
              {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-[#0a1f0a] border-b border-green-900/40 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="text-gray-300 text-sm font-semibold hidden md:block">
              Radio Asset Management System (RAMS)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-xs hidden md:block">
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}
              {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>

            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={18} />
              {recentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                  {recentCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-army-medium flex items-center justify-center text-white font-bold text-xs">
                {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div className="hidden md:block">
                <p className="text-white text-xs font-semibold">{user.name}</p>
                <p className="text-gray-400 text-[10px]">{user.role}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="h-8 bg-[#0a1f0a] border-t border-green-900/40 flex items-center justify-between px-6">
          <span className="text-gray-500 text-[10px]">Nigeria Army Signals Corps · Radio Asset Management System (RAMS)</span>
          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <span>🔒 Secure</span>
            <span>Authenticated Users Only</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
