import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  BarChart, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  Bell, 
  User,
  ChevronRight
} from 'lucide-react';

// Import Section Components
import Analysis from '../components/dashboard/Analysis';
import Simulation from '../components/dashboard/Simulation';
import History from '../components/dashboard/History';
import Settings from '../components/dashboard/Settings';
import ProfileModal from '../components/dashboard/ProfileModal';

import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analysis');
  const [analysisData, setAnalysisData] = useState(null);
  const [worlds, setWorlds] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  const userName = userProfile?.name || currentUser?.displayName || 'User';

  const renderContent = () => {
    switch (activeTab) {
      case 'analysis': return (
        <Analysis 
          setAnalysisData={setAnalysisData} 
          setWorlds={setWorlds} 
          analysisData={analysisData}
        />
      );
      case 'simulation': return (
        <Simulation 
          worlds={worlds} 
          analysisData={analysisData} 
        />
      );
      case 'history': return <History />;
      case 'settings': return <Settings />;
      default: return null;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'analysis': return "Deep Analysis";
      case 'simulation': return "Multiverse Simulations";
      case 'history': return "Report History";
      case 'settings': return "Settings";
      default: return "Dashboard";
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'analysis': return "Configure and launch high-fidelity fairness scans";
      case 'simulation': return "Explore parallel demographic outcomes";
      case 'history': return "Review and export previous audit results";
      case 'settings': return "Manage your account and engine preferences";
      default: return "";
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 p-6 flex flex-col gap-8 sticky top-0 h-screen bg-black/50 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight">Multiverse</span>
        </Link>

        <nav className="flex-1 space-y-1">
          <SidebarItem 
            icon={<Search size={20} />} 
            label="Analysis" 
            active={activeTab === 'analysis'} 
            onClick={() => setActiveTab('analysis')} 
          />
          <SidebarItem 
            icon={<BarChart size={20} />} 
            label="Simulations" 
            active={activeTab === 'simulation'} 
            onClick={() => setActiveTab('simulation')} 
          />
          <SidebarItem 
            icon={<HistoryIcon size={20} />} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <SidebarItem 
            icon={<SettingsIcon size={20} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold transition-all duration-300">{getPageTitle()}</h1>
              <p className="text-gray-400 mt-1 transition-all duration-300">{getPageSubtitle()}</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Bell className="text-gray-400 hover:text-white cursor-pointer transition-colors" size={22} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </div>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                Log Out
              </button>
              <div 
                onClick={() => setIsProfileModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/20 transition-all"
              >
                <User size={20} />
              </div>
            </div>
          </header>

          {/* Dynamic Section Rendering with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
        : 'text-gray-500 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="ml-auto w-1 h-4 bg-white rounded-full"
      />
    )}
  </button>
);

export default Dashboard;
