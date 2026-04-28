import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Briefcase, Save, Edit2 } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const ProfileModal = ({ isOpen, onClose, userProfile, setUserProfile }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    company: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile || currentUser) {
      setFormData({
        name: userProfile?.name || currentUser?.displayName || '',
        email: userProfile?.email || currentUser?.email || '',
        role: userProfile?.role || 'Data Scientist',
        company: userProfile?.company || 'Organization'
      });
    }
  }, [userProfile, currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: formData.name,
        role: formData.role,
        company: formData.company
      });
      
      setUserProfile(prev => ({
        ...prev,
        ...formData
      }));
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">User Profile</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center relative group">
                  <User size={40} className="text-blue-400" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <User size={14} /> Full Name
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-white text-lg font-medium">{formData.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} /> Email Address
                  </label>
                  {/* Email is typically non-editable in simple flows, or requires re-auth */}
                  <p className="text-white text-lg font-medium opacity-80">{formData.email}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={14} /> Role / Title
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-white text-lg font-medium">{formData.role}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={14} /> Organization
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-white text-lg font-medium">{formData.company}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      setFormData({
                        name: userProfile?.name || currentUser?.displayName || '',
                        email: userProfile?.email || currentUser?.email || '',
                        role: userProfile?.role || 'Data Scientist',
                        company: userProfile?.company || 'Organization'
                      });
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
