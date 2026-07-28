import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  HardHat,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Lock,
} from 'lucide-react';
import { UserAccount, Worker, Department, UserRole } from '../types';

interface UserAccountManagerProps {
  currentRole: UserRole; // 'officer' or 'admin'
  workers: Worker[];
  onRefreshData?: () => void;
}

export const UserAccountManager: React.FC<UserAccountManagerProps> = ({
  currentRole,
  workers,
  onRefreshData,
}) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'worker' | 'officer'>(
    currentRole === 'officer' ? 'worker' : 'worker'
  );
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Form state
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'officer' | 'worker'>('worker');
  const [department, setDepartment] = useState<Department>('Road Department');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch accounts from API
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddModal = (defaultRole: 'officer' | 'worker') => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPassword('pass123');
    setRole(defaultRole);
    setDepartment('Road Department');
    setPhone('');
    setEmail('');
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username);
    setPassword(u.password);
    setRole(u.role as 'officer' | 'worker');
    setDepartment(u.department || 'Road Department');
    setPhone(u.phone || '');
    setEmail(u.email || '');
    setFormError('');
    setShowAddModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) {
      setFormError('Please fill in Name, Username, and Password.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      if (editingUser) {
        // Edit existing
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            username: username.trim(),
            password,
            department,
            phone,
            email,
          }),
        });

        if (res.ok) {
          await fetchUsers();
          if (onRefreshData) onRefreshData();
          setShowAddModal(false);
          alert(`Account for ${name} updated successfully!`);
        } else {
          const err = await res.json();
          setFormError(err.error || 'Failed to update account.');
        }
      } else {
        // Create new
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            username: username.trim(),
            password,
            role,
            department,
            phone,
            email,
          }),
        });

        if (res.ok) {
          await fetchUsers();
          if (onRefreshData) onRefreshData();
          setShowAddModal(false);
          alert(`New ${role.toUpperCase()} account created for ${name}! Username: ${username}`);
        } else {
          const err = await res.json();
          setFormError(err.error || 'Failed to create account.');
        }
      }
    } catch (err) {
      console.error('Error saving user:', err);
      setFormError('Network error while saving user account.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, accountName: string) => {
    if (!confirm(`Are you sure you want to permanently delete the account for "${accountName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUsers();
        if (onRefreshData) onRefreshData();
        alert(`Account "${accountName}" deleted successfully.`);
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  // Filter accounts according to activeTab
  const displayedUsers = users.filter((u) => u.role === activeTab);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      {/* Top Header & Role Switch Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-slate-900">
              User Accounts & Credentials Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentRole === 'admin'
              ? 'Full System Authority: Add, edit credentials, or revoke Officer and Worker accounts'
              : 'Officer Authority: Add, assign credentials, and manage Field Worker accounts'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('worker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'worker'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Field Workers ({users.filter((u) => u.role === 'worker').length})</span>
            </button>

            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveTab('officer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'officer'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Dept Officers ({users.filter((u) => u.role === 'officer').length})</span>
              </button>
            )}
          </div>

          <button
            onClick={() => handleOpenAddModal(activeTab)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {activeTab === 'worker' ? 'Field Worker' : 'Department Officer'}</span>
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider">
            <tr>
              <th className="p-3.5">User / Contact</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Username</th>
              <th className="p-3.5">Assigned Password</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {displayedUsers.length > 0 ? (
              displayedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          u.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={u.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {u.email} | {u.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200">
                      {u.department || 'Road Department'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-indigo-700 bg-indigo-50/50 rounded-lg">
                    {u.username}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 min-w-[90px]">
                        {visiblePasswords[u.id] ? u.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(u.id)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title={visiblePasswords[u.id] ? 'Hide Password' : 'Show Password'}
                      >
                        {visiblePasswords[u.id] ? (
                          <EyeOff className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenEditModal(u)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg inline-flex items-center space-x-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg inline-flex items-center space-x-1 border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                  No {activeTab === 'worker' ? 'Field Worker' : 'Department Officer'} accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <span>{editingUser ? `Edit Account (${editingUser.name})` : `Add New ${role === 'worker' ? 'Field Worker' : 'Officer'}`}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  required
                />
              </div>

              {!editingUser && currentRole === 'admin' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'officer' | 'worker')}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="worker">Field Worker</option>
                    <option value="officer">Department Officer</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Road Department">Road Department</option>
                  <option value="Electricity Department">Electricity Department</option>
                  <option value="Water & Sewerage">Water & Sewerage</option>
                  <option value="Sanitation & Waste">Sanitation & Waste</option>
                  <option value="Environmental Protection">Environmental Protection</option>
                  <option value="Public Safety & Infrastructure">Public Safety</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Login Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. alex.rivera"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Login Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-1122"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@safecity.gov"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-extrabold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingUser ? 'Save Updates' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
