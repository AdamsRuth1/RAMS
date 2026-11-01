import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings as SettingsIcon, User, Shield, Bell, Database, Save, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    role: user.role,
    armyNo: user.armyNo,
    unit: '55 Sig Bde',
    notifications: true,
    overdueAlerts: true,
    darkMode: true,
    autoBackup: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-white font-bold text-2xl flex items-center gap-2">
          <SettingsIcon size={24} className="text-army-light" /> Settings
        </h1>
        <p className="text-gray-400 text-sm">Manage your account and system preferences</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-lg p-3 text-green-300 text-sm">
          <CheckCircle size={16} /> Settings saved successfully
        </div>
      )}

      <div className="flex gap-6">
        {/* Tab nav */}
        <div className="w-48 space-y-1 flex-shrink-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id ? 'bg-army-medium text-white' : 'text-gray-400 hover:bg-[#1a2e1a] hover:text-white'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card space-y-4">
              <h2 className="text-white font-semibold">Profile Information</h2>
              <div className="flex items-center gap-4 p-4 bg-[#0d2610] rounded-xl">
                <div className="w-16 h-16 rounded-full bg-army-medium flex items-center justify-center text-white font-bold text-xl">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.role} · {user.armyNo}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Army / Staff Number</label>
                  <input value={form.armyNo} onChange={(e) => setForm({...form, armyNo: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="form-select">
                    <option>Admin</option>
                    <option>Signals Officer</option>
                    <option>Quartermaster</option>
                    <option>Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Unit</label>
                  <input value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="form-input" />
                </div>
              </div>
              <button onClick={handleSave} className="btn-primary">
                <Save size={16} /> Save Changes
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card space-y-4">
              <h2 className="text-white font-semibold">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Current Password</label>
                  <input type="password" placeholder="••••••••" className="form-input" />
                </div>
                <div>
                  <label className="form-label">New Password</label>
                  <input type="password" placeholder="••••••••" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="form-input" />
                </div>
              </div>
              <button onClick={handleSave} className="btn-primary">
                <Save size={16} /> Update Password
              </button>
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-white font-medium mb-3">Session</h3>
                <p className="text-gray-400 text-sm">Last login: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card space-y-4">
              <h2 className="text-white font-semibold">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'notifications', label: 'System Notifications', desc: 'Show in-app notifications for new activity' },
                  { key: 'overdueAlerts', label: 'Overdue Return Alerts', desc: 'Alert when a radio has not been returned within 24 hours' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start justify-between p-3 bg-[#0d2610] rounded-xl">
                    <div>
                      <p className="text-white font-medium text-sm">{label}</p>
                      <p className="text-gray-400 text-xs">{desc}</p>
                    </div>
                    <button
                      onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                      className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${form[key] ? 'bg-army-medium' : 'bg-gray-700'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white mx-0.5 transition-transform ${form[key] ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="btn-primary">
                <Save size={16} /> Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="card space-y-4">
              <h2 className="text-white font-semibold">Data & Storage</h2>
              <div className="p-4 bg-[#0d2610] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">Local Storage</p>
                    <p className="text-gray-400 text-xs">All data is stored in your browser's local storage</p>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Active</p>
                    <p className="text-army-light text-xs">Persisted</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-[#0d2610] rounded-xl">
                  <div>
                    <p className="text-white font-medium text-sm">Auto Backup</p>
                    <p className="text-gray-400 text-xs">Automatically export data to CSV weekly</p>
                  </div>
                  <button
                    onClick={() => setForm((f) => ({ ...f, autoBackup: !f.autoBackup }))}
                    className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${form.autoBackup ? 'bg-army-medium' : 'bg-gray-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white mx-0.5 transition-transform ${form.autoBackup ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (window.confirm('Clear all data? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="btn-danger"
                >
                  Clear All Data
                </button>
              </div>
              <div className="mt-4 p-4 bg-[#0d2610] rounded-xl">
                <h3 className="text-white font-semibold text-sm mb-2">About RAMS</h3>
                <p className="text-gray-400 text-xs">Radio Asset Management System v1.0</p>
                <p className="text-gray-400 text-xs">Nigerian Army Signals Corps</p>
                <p className="text-gray-500 text-xs mt-1">Communications · Information · Victory</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
