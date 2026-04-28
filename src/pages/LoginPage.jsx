import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-card !p-8 backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl">
          <div className="text-center mb-10">
            <Link to="/" className="inline-block w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-6">
              <div className="w-6 h-6 bg-black rounded-sm rotate-45" />
            </Link>
            <h1 className="text-3xl font-bold mb-2 text-white">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Continue to Bias Multiverse Engine</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="input-field w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input-field w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
              </button>
              <Link 
                to="/signup"
                className="btn-secondary w-full py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all text-center block"
              >
                Create Account
              </Link>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-gray-500">
            By continuing, you agree to our <a href="#" className="text-gray-400 hover:text-white transition-colors underline underline-offset-4">Terms of Service</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
