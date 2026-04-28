import React, { useState, useEffect } from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  Trash2, 
  Lock, 
  ChevronRight, 
  ShieldCheck, 
  Mail, 
  X,
  AlertCircle,
  Key
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth';

const Settings = () => {
  const [view, setView] = useState('menu'); // menu, profile, password
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [profile, setProfile] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', msg: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Theme application
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile({
          ...docSnap.data(),
          email: auth.currentUser.email
        });
      }
    };
    if (view === 'profile') fetchProfile();
  }, [view]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleClearHistory = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all history? This action cannot be undone.");
    if (!confirmed || !auth.currentUser) return;

    setIsDeleting(true);
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const reportsRef = collection(userDocRef, "reports");
      const querySnapshot = await getDocs(reportsRef);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      alert("History cleared successfully.");
      // Trigger a refresh if needed (History component usually fetches on mount)
    } catch (err) {
      console.error(err);
      alert("Failed to clear history.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: 'loading', msg: 'Verifying...' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, passwordForm.oldPassword);
      
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);
      
      setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStatus({ type: '', msg: '' });
      }, 2000);
    } catch (err) {
      console.error(err);
      setPasswordStatus({ type: 'error', msg: 'Incorrect old password or update failed.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {view === 'menu' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-8">Settings</h2>
          
          <SettingsMenuButton 
            icon={<User size={20} />} 
            title="Profile" 
            desc="View your personal information and account details."
            onClick={() => setView('profile')}
          />

          <div className="glass-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <h4 className="font-bold">Display Mode</h4>
                <p className="text-xs text-gray-500">Currently in {theme} mode</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-14 h-7 rounded-full p-1 transition-colors relative ${theme === 'light' ? 'bg-blue-500' : 'bg-white/10'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${theme === 'light' ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>

          <SettingsMenuButton 
            icon={<Trash2 size={20} className="text-red-400" />} 
            title="Clear All History" 
            desc="Permanently delete all analysis and simulation logs."
            onClick={handleClearHistory}
            loading={isDeleting}
          />

          <SettingsMenuButton 
            icon={<Key size={20} />} 
            title="Change Password" 
            desc="Update your security credentials."
            onClick={() => setIsPasswordModalOpen(true)}
          />
        </div>
      )}

      {view === 'profile' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
          <button onClick={() => setView('menu')} className="text-sm text-gray-500 hover:text-white flex items-center gap-2">
            <ChevronRight size={16} className="rotate-180" /> Back to Settings
          </button>
          <div className="glass-card space-y-10">
            <div className="flex items-center gap-6 pb-10 border-b border-white/5">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                <User size={40} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{profile?.name || 'Loading...'}</h3>
                <p className="text-gray-500 font-medium">{profile?.role || 'Data Scientist'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProfileField label="Email Address" value={profile?.email} icon={<Mail size={16} />} />
              <ProfileField label="Organization" value={profile?.company || 'N/A'} icon={<ShieldCheck size={16} />} />
              <ProfileField label="Account ID" value={auth.currentUser?.uid.substr(0, 12) + '...'} icon={<Lock size={16} />} />
              <ProfileField label="Last Login" value={new Date().toLocaleDateString()} icon={<AlertCircle size={16} />} />
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)} />
          <div className="relative w-full max-w-md glass-card border border-white/20 p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Update Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Old Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  className="input-field" 
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="input-field" 
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="input-field" 
                  placeholder="••••••••"
                />
              </div>

              {passwordStatus.msg && (
                <p className={`text-xs font-medium ${passwordStatus.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                  {passwordStatus.msg}
                </p>
              )}

              <button 
                type="submit" 
                disabled={passwordStatus.type === 'loading'}
                className="w-full btn-primary py-3 mt-4 disabled:opacity-50"
              >
                {passwordStatus.type === 'loading' ? 'Processing...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsMenuButton = ({ icon, title, desc, onClick, loading }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className="w-full glass-card flex items-center justify-between group hover:border-white/20 transition-all disabled:opacity-50"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors">
        {icon}
      </div>
      <div className="text-left">
        <h4 className="font-bold">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
  </button>
);

const ProfileField = ({ label, value, icon }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </label>
    <p className="text-lg font-medium text-white">{value || '---'}</p>
  </div>
);

export default Settings;
