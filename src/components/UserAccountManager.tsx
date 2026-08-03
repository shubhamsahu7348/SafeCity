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
  Upload,
  Calendar,
  Camera,
  Phone,
  X,
  Save,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { UserAccount, Worker, Department, UserRole } from '../types';
import { INITIAL_USERS } from '../server/mockData';

interface UserAccountManagerProps {
  currentRole: UserRole; // 'officer' or 'admin'
  currentUserDepartment?: string;
  workers: Worker[];
  onRefreshData?: () => void;
}

export const UserAccountManager: React.FC<UserAccountManagerProps> = ({
  currentRole,
  currentUserDepartment,
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
  const [phoneDigits, setPhoneDigits] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [joiningDate, setJoiningDate] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Filter states
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch accounts from API
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch users from backend, using default accounts list:', err);
    }
    setUsers(INITIAL_USERS);
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
    
    const targetDept = (currentUserDepartment as Department) || 'Road Department';
    const isTrafficPolice = targetDept === 'Traffic Police Department' || filterDepartment === 'Traffic Police Department';
    const effectiveRole = isTrafficPolice ? 'officer' : defaultRole;

    setRole(effectiveRole);
    setDepartment(targetDept);
    setPhoneDigits('');
    setEmail('');
    setAvatarUrl('');
    setJoiningDate('');
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
    
    // Clean +91 or +1 prefix for editing
    const rawPhone = (u.phone || '').replace(/^\+91\s*/, '').replace(/^\+1\s*/, '').trim();
    setPhoneDigits(rawPhone);
    setEmail(u.email || '');
    setAvatarUrl(u.avatarUrl || '');
    setJoiningDate(u.joiningDate || '');
    setFormError('');
    setShowAddModal(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) {
      setFormError('Please fill in Name, Username, and Password.');
      return;
    }

    if (department === 'Traffic Police Department' && role === 'worker') {
      setFormError('Traffic Police Department does not use field workers. Only Traffic Officers handle traffic problems.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    const formattedPhone = phoneDigits.trim() ? `+91 ${phoneDigits.trim()}` : '';

    try {
      if (editingUser) {
        const payload: Record<string, any> = {
          name,
          username: username.trim(),
          password,
          department,
          phone: formattedPhone,
          email,
          avatarUrl,
        };

        // Date of joining locked once set
        const isAlreadyLocked = Boolean(editingUser.joiningDate && editingUser.joiningDate.trim().length > 0);
        if (!isAlreadyLocked && joiningDate.trim()) {
          payload.joiningDate = joiningDate.trim();
        }

        // Edit existing
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          await fetchUsers();
          if (onRefreshData) onRefreshData();
          setShowAddModal(false);
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
            phone: formattedPhone,
            email,
            avatarUrl,
            joiningDate: joiningDate.trim() || undefined,
          }),
        });

        if (res.ok) {
          await fetchUsers();
          if (onRefreshData) onRefreshData();
          setShowAddModal(false);
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

  // Filter accounts according to activeTab, officer department restriction, department filter dropdown, and search query
  const displayedUsers = users.filter((u) => {
    if (u.role !== activeTab) return false;

    // Department Restriction or Admin Department Filter
    if (currentRole !== 'admin' && currentUserDepartment) {
      if (u.department && u.department !== currentUserDepartment) return false;
    } else if (filterDepartment !== 'All') {
      if ((u.department || 'Road Department') !== filterDepartment) return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.name.toLowerCase().includes(q);
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').toLowerCase().includes(q);
      const matchDept = (u.department || '').toLowerCase().includes(q);
      if (!matchName && !matchUsername && !matchEmail && !matchPhone && !matchDept) {
        return false;
      }
    }

    return true;
  });

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

      {/* Department Filter Bar & Quick Pills */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 text-xs font-black text-slate-800 mr-1 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Department Filter:</span>
            </div>

            {currentRole === 'admin' ? (
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Departments ({users.filter((u) => u.role === activeTab).length})</option>
                <option value="Road Department">
                  Road Department ({users.filter((u) => u.role === activeTab && (u.department || 'Road Department') === 'Road Department').length})
                </option>
                <option value="Electricity Department">
                  Electricity Department ({users.filter((u) => u.role === activeTab && u.department === 'Electricity Department').length})
                </option>
                <option value="Water & Sewerage">
                  Water & Sewerage ({users.filter((u) => u.role === activeTab && u.department === 'Water & Sewerage').length})
                </option>
                <option value="Sanitation & Waste">
                  Sanitation & Waste ({users.filter((u) => u.role === activeTab && u.department === 'Sanitation & Waste').length})
                </option>
                <option value="Environmental Protection">
                  Environmental Protection ({users.filter((u) => u.role === activeTab && u.department === 'Environmental Protection').length})
                </option>
                <option value="Public Safety & Infrastructure">
                  Public Safety ({users.filter((u) => u.role === activeTab && u.department === 'Public Safety & Infrastructure').length})
                </option>
                <option value="Traffic Police Department">
                  Traffic Police ({users.filter((u) => u.role === activeTab && u.department === 'Traffic Police Department').length})
                </option>
              </select>
            ) : (
              <div className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dept: <strong className="text-indigo-700">{currentUserDepartment || 'Road Department'}</strong></span>
              </div>
            )}

            {currentRole === 'admin' && filterDepartment !== 'All' && (
              <button
                onClick={() => setFilterDepartment('All')}
                className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors flex items-center space-x-1"
              >
                <span>Reset Filter</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Query Input */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'worker' ? 'field workers' : 'officers'}...`}
              className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Department Clickable Pills for Admin */}
        {currentRole === 'admin' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Quick Select:</span>
            {[
              { id: 'All', label: 'All Depts' },
              { id: 'Road Department', label: '🛣️ Road' },
              { id: 'Electricity Department', label: '⚡ Electricity' },
              { id: 'Water & Sewerage', label: '💧 Water' },
              { id: 'Sanitation & Waste', label: '🧹 Sanitation' },
              { id: 'Environmental Protection', label: '🌱 Environment' },
              { id: 'Public Safety & Infrastructure', label: '🛡️ Public Safety' },
              { id: 'Traffic Police Department', label: '🚦 Traffic Police' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setFilterDepartment(d.id)}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all ${
                  filterDepartment === d.id
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
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
                <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                  {activeTab === 'worker' && (currentUserDepartment === 'Traffic Police Department' || filterDepartment === 'Traffic Police Department') ? (
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-extrabold text-amber-800 text-sm">
                        🚦 Traffic Police Department operates exclusively with Traffic Officers.
                      </p>
                      <p className="text-xs text-slate-500">
                        Field worker accounts are not used for Traffic Police issues as Traffic Officers handle problems directly on-site.
                      </p>
                      {currentRole === 'admin' && (
                        <button
                          onClick={() => setActiveTab('officer')}
                          className="mt-2 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center space-x-1.5"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>View Traffic Officers Roster</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span>No {activeTab === 'worker' ? 'Field Worker' : 'Department Officer'} accounts found.</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <span>{editingUser ? `Edit Account (${editingUser.name})` : `Add New ${role === 'worker' ? 'Field Worker' : 'Officer'}`}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              {/* Profile Image Upload */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1">
                  Profile Picture / Avatar Image
                </label>
                <div className="flex items-center space-x-3">
                  <img
                    src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={name || 'Avatar'}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-sm"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      id="account-image-upload"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="account-image-upload"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] rounded-lg cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image File</span>
                    </label>
                  </div>
                </div>
              </div>

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
                    onChange={(e) => {
                      const newRole = e.target.value as 'officer' | 'worker';
                      if (department === 'Traffic Police Department' && newRole === 'worker') {
                        setFormError('Traffic Police Department does not use field workers. Only Traffic Officers handle traffic problems.');
                        return;
                      }
                      setRole(newRole);
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="worker" disabled={department === 'Traffic Police Department'}>Field Worker {department === 'Traffic Police Department' ? '(Not Available for Traffic Police)' : ''}</option>
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
                  onChange={(e) => {
                    const newDept = e.target.value as Department;
                    setDepartment(newDept);
                    if (newDept === 'Traffic Police Department') {
                      setRole('officer');
                    }
                  }}
                  disabled={currentRole !== 'admin'}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold disabled:bg-slate-100 disabled:text-slate-600"
                >
                  <option value="Road Department">Road Department</option>
                  <option value="Electricity Department">Electricity Department</option>
                  <option value="Water & Sewerage">Water & Sewerage</option>
                  <option value="Sanitation & Waste">Sanitation & Waste</option>
                  <option value="Environmental Protection">Environmental Protection</option>
                  <option value="Public Safety & Infrastructure">Public Safety</option>
                  <option value="Traffic Police Department">Traffic Police Department</option>
                </select>
                {department === 'Traffic Police Department' && (
                  <p className="text-[10px] text-amber-700 font-bold mt-1">
                    ⚠️ Traffic Police Department operates exclusively with Traffic Officers. No field worker dispatch option is provided.
                  </p>
                )}
                {currentRole !== 'admin' && department !== 'Traffic Police Department' && (
                  <p className="text-[10px] text-amber-700 font-bold mt-1">
                    Locked to your officer department ({currentUserDepartment || 'Road Department'})
                  </p>
                )}
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
                    Mobile (+91 India)
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden bg-white">
                    <span className="px-2.5 py-2.5 bg-slate-100 text-slate-700 font-extrabold text-[11px] border-r border-slate-300">
                      +91
                    </span>
                    <input
                      type="text"
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-2.5 py-2.5 font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
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

              {/* Date of Joining Field */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Date of Joining</span>
                  </label>
                  {editingUser && editingUser.joiningDate && editingUser.joiningDate.trim().length > 0 ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[9px] border border-amber-300">
                      <Lock className="w-2.5 h-2.5 text-amber-700" />
                      <span>Locked (Editing Restricted)</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      Editable Once Only
                    </span>
                  )}
                </div>

                {editingUser && editingUser.joiningDate && editingUser.joiningDate.trim().length > 0 ? (
                  <div className="p-2 bg-slate-100 border border-slate-300 rounded-xl font-mono font-bold text-slate-700 flex items-center justify-between text-xs cursor-not-allowed">
                    <span>{editingUser.joiningDate}</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ) : (
                  <div>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs"
                    />
                    <p className="mt-1 text-[10px] text-slate-500 font-medium">
                      Once saved, Date of Joining will be locked permanently.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl flex items-center space-x-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold rounded-xl shadow-md disabled:opacity-50 flex items-center space-x-1.5 transition-all"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : editingUser ? (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Updates</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
