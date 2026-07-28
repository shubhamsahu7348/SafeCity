import React, { useState } from 'react';
import {
  User,
  KeyRound,
  Phone,
  Mail,
  ShieldCheck,
  X,
  CheckCircle2,
  ShieldAlert,
  Eye,
  EyeOff,
  Building2,
  HardHat,
  Settings,
  Upload,
  Calendar,
  Lock,
  Camera,
} from 'lucide-react';
import { UserAccount } from '../types';

interface EditProfileModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserAccount) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentUser,
  onClose,
  onUserUpdated,
}) => {
  const [name, setName] = useState<string>(currentUser.name || '');
  const [username, setUsername] = useState<string>(currentUser.username || '');
  const [password, setPassword] = useState<string>(currentUser.password || '');
  
  // Format phone number with +91
  const initialPhone = (currentUser.phone || '').replace(/^\+91\s*/, '').replace(/^\+1\s*/, '').trim();
  const [phoneDigits, setPhoneDigits] = useState<string>(initialPhone);
  
  const [email, setEmail] = useState<string>(currentUser.email || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || '');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Date of joining locked state
  const isJoiningDateLocked = Boolean(currentUser.joiningDate && currentUser.joiningDate.trim().length > 0);
  const [joiningDate, setJoiningDate] = useState<string>(currentUser.joiningDate || '');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Handle local image file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) {
      setErrorMsg('Name, username, and password are required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Format phone with +91 country code
    const formattedPhone = phoneDigits.trim() ? `+91 ${phoneDigits.trim()}` : '';

    try {
      const payload: Partial<UserAccount> = {
        name: name.trim(),
        username: username.trim(),
        password,
        phone: formattedPhone,
        email: email.trim(),
        avatarUrl: avatarUrl.trim(),
      };

      // Only update joiningDate if it wasn't locked previously and user entered a date
      if (!isJoiningDateLocked && joiningDate.trim()) {
        payload.joiningDate = joiningDate.trim();
      }

      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg('Profile updated successfully!');
        onUserUpdated(data);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setErrorMsg(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Update profile failed:', err);
      setErrorMsg('Network error while updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (currentUser.role) {
      case 'officer':
        return <Building2 className="w-5 h-5 text-amber-400" />;
      case 'worker':
        return <HardHat className="w-5 h-5 text-emerald-400" />;
      case 'admin':
        return <Settings className="w-5 h-5 text-purple-400" />;
      default:
        return <User className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-900/90 rounded-2xl border border-indigo-800/60 shadow-md">
              {getRoleIcon()}
            </div>
            <div>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                {currentUser.role.toUpperCase()} ACCOUNT
              </span>
              <h2 className="text-lg font-black text-white mt-0.5">Edit Profile Credentials</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-slate-700">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Image Upload Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">
              Profile Picture / Avatar Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-300 shadow-md"
                />
                <label
                  htmlFor="profile-image-upload"
                  className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white"
                >
                  <Camera className="w-5 h-5" />
                </label>
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="profile-image-upload"
                  className="inline-flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-sm cursor-pointer transition-colors active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image File</span>
                </label>
                <p className="text-[10px] text-slate-500 font-medium">
                  Select a photo from your device (JPG, PNG, max 5MB).
                </p>
              </div>
            </div>
          </div>

          {/* Full Name Input */}
          <div className="space-y-1">
            <label className="block font-black text-slate-700 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-black text-slate-700 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-black text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Phone Number with +91 Country Code Prefix */}
          <div className="space-y-1">
            <label className="block font-black text-slate-700 uppercase tracking-wider">
              Mobile Number (+91 India)
            </label>
            <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500">
              <span className="px-3 py-2.5 bg-slate-200 text-slate-800 font-extrabold text-xs border-r border-slate-300 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>+91</span>
              </span>
              <input
                type="text"
                value={phoneDigits}
                onChange={(e) => setPhoneDigits(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-2.5 bg-transparent font-mono font-bold text-slate-900 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="block font-black text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@safecity.gov"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-xs"
              />
            </div>
          </div>

          {/* Date of Joining (Editable once, locked if already set) */}
          <div className="space-y-1 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="block font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Date of Joining</span>
              </label>
              {isJoiningDateLocked ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-lg font-extrabold text-[10px] border border-amber-300">
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>Locked (Cannot Edit)</span>
                </span>
              ) : (
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Editable Once Only
                </span>
              )}
            </div>

            {isJoiningDateLocked ? (
              <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-xl font-mono font-bold text-slate-700 flex items-center justify-between text-xs cursor-not-allowed">
                <span>{joiningDate}</span>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
            ) : (
              <div>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1.5 text-[10px] text-amber-800 font-bold bg-amber-50/90 p-2 rounded-xl border border-amber-200">
                  ⚠️ Important: Once Date of Joining is updated and saved, it will be locked permanently and cannot be edited again.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold rounded-xl shadow-md disabled:opacity-50 active:scale-95 transition-all"
            >
              {isLoading ? 'Saving Changes...' : 'Save Profile Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
