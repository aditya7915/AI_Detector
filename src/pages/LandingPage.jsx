import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Zap, Globe, BarChart3, Users, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeroScene from '../components/3d/HeroScene';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);
  const { scrollYProgress } = useScroll();

  // Parallax effects for foreground elements
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02040a] to-[#060c18] text-white overflow-x-hidden selection:bg-blue-500/30 selection:text-white font-sans">
      
      {/* 3D Cinematic Background Canvas */}
      <div className="fixed inset-0 z-0">
        <HeroScene scrollYProgress={scrollYProgress} isHoveringCTA={isHoveringCTA} />
        
        {/* Soft fog between 3D scene and UI */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#02040a] via-[#02040a]/50 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10">
        {/* Header/Nav */}
        <header className="fixed top-0 left-0 right-0 py-6 px-8 flex justify-between items-center z-50 glass-nav">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
            </div>
            <span className="font-bold text-xl tracking-tight">Multiverse</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-white text-gray-300 transition-colors">Sign In</button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
          <motion.div
            style={{ y: yHeroText, opacity: opacityHeroText }}
            className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-8 glass-panel p-12 rounded-3xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-sm font-medium text-gray-300">Engine v2.0 is now live</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                Bias <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 drop-shadow-lg">Multiverse</span>
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-gray-300 text-xl md:text-2xl max-w-2xl leading-relaxed font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            >
              The world's most advanced AI fairness platform. Detect, simulate, and mitigate algorithmic bias across infinite demographic dimensions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 3.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap justify-center gap-6 mt-8"
            >
              <button 
                onClick={() => navigate('/signup')}
                onMouseEnter={() => setIsHoveringCTA(true)}
                onMouseLeave={() => setIsHoveringCTA(false)}
                className="group relative flex items-center gap-2 bg-white text-black font-semibold py-4 px-10 rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Initialize Engine</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center gap-2 border border-white/20 text-white font-medium py-4 px-10 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-md">
                Read Documentation
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 max-w-7xl mx-auto relative">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Unrivaled Bias Intelligence</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Powerful tools designed for the most demanding AI safety teams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="text-blue-400 w-6 h-6" />}
              title="Adversarial Testing"
              description="Stress test your models against extreme demographic edge cases to ensure true parity."
            />
            <FeatureCard 
              icon={<Zap className="text-yellow-400 w-6 h-6" />}
              title="Instant Analysis"
              description="Our engine processes millions of data points in seconds to deliver real-time fairness metrics."
            />
            <FeatureCard 
              icon={<Globe className="text-green-400 w-6 h-6" />}
              title="Multiverse Simulation"
              description="Simulate how your model would perform in different societal contexts and demographic shifts."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-purple-400 w-6 h-6" />}
              title="Explainable UI"
              description="Don't just see the bias—understand exactly why it's happening with our deep-dive panels."
            />
            <FeatureCard 
              icon={<Users className="text-pink-400 w-6 h-6" />}
              title="Team Collaboration"
              description="Shared workspaces for data scientists, policy experts, and legal teams to align on fairness."
            />
            <FeatureCard 
              icon={<Layers className="text-indigo-400 w-6 h-6" />}
              title="API Integration"
              description="Seamlessly plug our engine into your existing CI/CD pipelines and MLOps workflows."
            />
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">System Architecture</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0" />
            
            <Step 
              number="01"
              title="Connect Model"
              description="Upload your dataset or connect via API to our secure engine for initial ingestion."
            />
            <Step 
              number="02"
              title="Multiverse Scan"
              description="Our engine generates thousands of permutations to identify hidden bias patterns."
            />
            <Step 
              number="03"
              title="Mitigate & Monitor"
              description="Implement suggested fairness weights and monitor performance in real-time."
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/10 px-6 backdrop-blur-lg bg-black/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 opacity-80">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-sm rotate-45" />
              </div>
              <span className="font-bold text-lg">Multiverse</span>
            </div>
            <div className="flex gap-8 text-gray-500 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
            <p className="text-gray-600 text-sm">© 2026 Bias Multiverse Engine. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="group relative bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors duration-300 backdrop-blur-sm"
  >
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className="w-14 h-14 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4 tracking-tight text-white/90">{title}</h3>
      <p className="text-gray-400/80 leading-relaxed text-sm font-light">{description}</p>
    </div>
  </motion.div>
);

const Step = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center space-y-6 relative z-10 group">
    <div className="w-20 h-20 rounded-2xl border border-white/10 flex items-center justify-center text-2xl font-bold bg-black/50 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:border-white/30 transition-colors duration-300">
      <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
        {number}
      </span>
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs mx-auto font-light leading-relaxed">{description}</p>
    </div>
  </div>
);

export default LandingPage;

