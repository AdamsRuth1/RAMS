import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Settings as SettingsIcon, User, Shield, Bell,
  Database, Save, CheckCircle, Users, Plus, Trash2,
  Lock, Eye, EyeOff, AlertCircle, X, KeyRound
} from 'lucide-react';
import { format } from 'date-fns';

export default function Settings() {
  const {
    user, users = [], updateUser, addUser, deleteUser,
    changePassword
  } = useStore();

  const [activeTab, setActiveTab] = useState('users');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    role: user.role || 'Admin',
    armyNo: user.armyNo || '',
    unit: user.unit || '55 Sig Bde',
  });

  // Security (password change) form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Add User modal state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'Signals Officer',
    armyNo: '',
    unit: '55 Sig Bde',
  });
  const [showNewUserPass, setShowNewUserPass] = useState(false);

  // Edit user password modal
  const [editUserModal, setEditUserModal] = useState(null);
  const [editNewPass, setEditNewPass] = useState('');

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const handleSaveProfile = () => {
    updateUser(user.id, profileForm);
    triggerSuccess('Profile information updated successfully.');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      triggerError('Please enter current and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerError('New passwords do not match.');
      return;
    }
    const res = changePassword(user.id, currentPassword, newPassword);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerSuccess('Password changed successfully.');
    } else {
      triggerError(res.error || 'Failed to update password.');
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim() || !newUser.name.trim()) {
      triggerError('Username, Password, and Full Name are required.');
      return;
    }
    const res = addUser(newUser);
    if (res.success) {
      setNewUser({
        username: '',
        password: '',
        name: '',
        role: 'Signals Officer',
        armyNo: '',
        unit: '55 Sig Bde',
      });
      setShowAddUser(false);
      triggerSuccess(`User "${res.user.name}" created successfully! They can now log in.`);
    } else {
      triggerError(res.error || 'Could not create user.');
    }
  };

  const handleToggleStatus = (u) => {
    const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
    updateUser(u.id, { status: nextStatus });
    triggerSuccess(`User "${u.username}" marked as ${nextStatus}.`);
  };

  const handleDeleteUser = (u) => {
    if (u.id === user.id) {
      triggerError('You cannot delete your own logged-in account.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete user "${u.name}" (${u.username})?`)) {
      const res = deleteUser(u.id);
      if (res.success) {
        triggerSuccess(`User "${u.username}" deleted.`);
      } else {
        triggerError(res.error || 'Failed to delete user.');
      }
    }
  };

  const handleResetUserPassword = () => {
    if (!editNewPass || editNewPass.length < 4) {
      triggerError('New password must be at least 4 characters.');
      return;
    }
    updateUser(editUserModal.id, { password: editNewPass.trim() });
    setEditUserModal(null);
    setEditNewPass('');
    triggerSuccess('User password updated successfully.');
  };

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'profile', label: 'Officer Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-white font-bold text-2xl flex items-center gap-2">
          <SettingsIcon size={24} className="text-army-light" /> Settings &amp; Administration
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Manage system accounts, user credentials, security keys, and preferences.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-950/80 border border-green-600 rounded-xl p-3.5 text-green-300 text-sm animate-fadeIn">
          <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-950/80 border border-red-600 rounded-xl p-3.5 text-red-300 text-sm animate-fadeIn">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Tabs */}
        <div className="w-full md:w-56 space-y-1 flex-shrink-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-army-medium text-white shadow-lg'
                  : 'text-gray-400 hover:bg-[#142e17] hover:text-white'
              }`}
            >
              <Icon size={17} className={activeTab === id ? 'text-white' : 'text-gray-400'} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 min-w-0">
          {/* TAB 1: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="card space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                <div>
                  <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <Users size={20} className="text-army-light" />
                    System Users &amp; Operator Accounts
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Create and manage login credentials for armory officers and operators.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUser(true)}
                  className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus size={15} /> Add New User
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto border border-green-950 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0b1f0e] border-b border-green-900/60 text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Username / ID</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/80">
                    {users.map((u) => {
                      const isSelf = u.id === user.id;
                      return (
                        <tr key={u.id} className="hover:bg-[#0f2a14]/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-army-medium border border-green-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm flex items-center gap-1.5">
                                  {u.name}
                                  {isSelf && (
                                    <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.2 rounded font-mono">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-gray-500 text-xs">{u.armyNo || '—'}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-xs">
                            <span className="text-army-light font-bold bg-[#0d2612] px-2 py-0.5 rounded border border-green-900">
                              {u.username}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-xs text-gray-300">
                            <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-200 border border-gray-700">
                              {u.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                                u.status === 'Active'
                                  ? 'bg-green-950 text-green-400 border border-green-800 hover:bg-green-900'
                                  : 'bg-red-950 text-red-400 border border-red-800 hover:bg-red-900'
                              }`}
                              title="Click to toggle status"
                            >
                              {u.status || 'Active'}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => { setEditUserModal(u); setEditNewPass(''); }}
                                className="text-xs text-army-light hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-[#0d2610] hover:bg-[#153e19] border border-green-900"
                                title="Reset Password"
                              >
                                <KeyRound size={12} /> Password
                              </button>
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => handleDeleteUser(u)}
                                className="text-red-500 hover:text-red-400 p-1.5 disabled:opacity-20 disabled:cursor-not-allowed"
                                title={isSelf ? 'Cannot delete your own account' : 'Delete User'}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & PASSWORD CHANGE */}
          {activeTab === 'security' && (
            <div className="card space-y-5">
              <div className="pb-3 border-b border-gray-800">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Shield size={20} className="text-army-light" />
                  Account Security &amp; Password
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Update your personal login password for account: <strong className="text-white font-mono">{user.username || 'admin'}</strong>
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="form-label">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="form-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">New Password *</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min. 4 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Confirm New Password *</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button type="submit" className="btn-primary py-2.5 px-6 text-sm">
                  <Lock size={15} /> Update My Password
                </button>
              </form>

              <div className="pt-4 border-t border-gray-800 text-xs text-gray-500 space-y-1">
                <p>🔒 Session security: Login credentials are encrypted and stored in local database.</p>
                <p>💡 Tip: Use a strong passphrase for system accounts operating field radio equipment.</p>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICER PROFILE */}
          {activeTab === 'profile' && (
            <div className="card space-y-5">
              <div className="pb-3 border-b border-gray-800">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <User size={20} className="text-army-light" />
                  Officer Profile Details
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Information displayed on transaction slips and system activity logs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name &amp; Rank *</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Army Number / Staff ID *</label>
                  <input
                    type="text"
                    value={profileForm.armyNo}
                    onChange={(e) => setProfileForm({ ...profileForm, armyNo: e.target.value })}
                    className="form-input font-mono"
                  />
                </div>

                <div>
                  <label className="form-label">Role</label>
                  <select
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="form-select"
                  >
                    <option>Admin</option>
                    <option>Signals Officer</option>
                    <option>Quartermaster</option>
                    <option>Armorer</option>
                    <option>Operator</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Unit / Brigade</label>
                  <input
                    type="text"
                    value={profileForm.unit}
                    onChange={(e) => setProfileForm({ ...profileForm, unit: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="btn-primary py-2.5 px-6 text-sm"
              >
                <Save size={15} /> Save Profile Changes
              </button>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="card space-y-4">
              <h2 className="text-white font-bold text-lg">Notification Preferences</h2>
              <div className="p-4 bg-[#0d2412] rounded-xl border border-green-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">Overdue Return Alerts</p>
                    <p className="text-gray-400 text-xs">Notify when radios are signed out longer than 24 hours.</p>
                  </div>
                  <span className="badge-available">Enabled</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-green-900/40">
                  <div>
                    <p className="text-white font-medium text-sm">Low Stock Inventory Warnings</p>
                    <p className="text-gray-400 text-xs">Alert when available radio quantity drops below threshold.</p>
                  </div>
                  <span className="badge-available">Enabled</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA & STORAGE */}
          {activeTab === 'data' && (
            <div className="card space-y-4">
              <h2 className="text-white font-bold text-lg">Database &amp; Local Storage</h2>
              <div className="p-4 bg-[#0d2412] rounded-xl border border-green-900/60 space-y-2 text-xs">
                <p className="text-white font-semibold">Active Storage: Local Browser Database (Persisted)</p>
                <p className="text-gray-300">
                  All personnel records, registered radios, captured biometric photos, and user credentials are saved securely in your browser's persistent storage.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all data and reset to initial army signals registry?')) {
                      localStorage.removeItem('rams-storage');
                      window.location.reload();
                    }
                  }}
                  className="btn-danger text-xs py-2 px-3.5"
                >
                  Reset System Data to Defaults
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD NEW USER */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="card w-full max-w-lg border border-green-700/60 bg-[#0c2210] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-green-800 pb-3">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Users size={18} className="text-army-light" />
                Add New System User / Operator
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Username * (Unique login ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. officer_bello"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="form-input font-mono"
                  />
                </div>

                <div>
                  <label className="form-label">Password *</label>
                  <div className="relative">
                    <input
                      type={showNewUserPass ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="form-input pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPass(!showNewUserPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showNewUserPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Officer / Operator Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAPT O. K. Bello"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Army Number / Staff ID</label>
                  <input
                    type="text"
                    placeholder="e.g. NA/22/4015"
                    value={newUser.armyNo}
                    onChange={(e) => setNewUser({ ...newUser, armyNo: e.target.value })}
                    className="form-input font-mono"
                  />
                </div>

                <div>
                  <label className="form-label">Assigned Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="form-select"
                  >
                    <option>Signals Officer</option>
                    <option>Quartermaster</option>
                    <option>Armorer</option>
                    <option>Admin</option>
                    <option>Operator</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-green-800">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 btn-secondary justify-center py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 text-xs font-semibold"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET USER PASSWORD */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="card w-full max-w-sm border border-green-700/60 bg-[#0c2210] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-green-800 pb-3">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <KeyRound size={16} className="text-army-light" />
                Reset Password: {editUserModal.username}
              </h3>
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-gray-300 text-xs">
                Enter a new password for <strong className="text-white">{editUserModal.name}</strong>.
              </p>
              <div>
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={editNewPass}
                  onChange={(e) => setEditNewPass(e.target.value)}
                  className="form-input font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                className="flex-1 btn-secondary justify-center py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetUserPassword}
                className="flex-1 btn-primary justify-center py-2 text-xs"
              >
                Save New Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
