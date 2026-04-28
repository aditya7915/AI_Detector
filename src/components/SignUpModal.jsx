import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

const SignUpModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      alert('Account created successfully!');
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300 ml-1">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Acme Corp"
                  className={`input-field ${errors.companyName ? 'border-red-500/50' : ''}`}
                />
                {errors.companyName && <p className="text-xs text-red-500 ml-1">{errors.companyName}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300 ml-1">Company Email ID</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className={`input-field ${errors.email ? 'border-red-500/50' : ''}`}
                />
                {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300 ml-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Business Ave, Tech City"
                  rows={3}
                  className={`input-field resize-none ${errors.address ? 'border-red-500/50' : ''}`}
                />
                {errors.address && <p className="text-xs text-red-500 ml-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300 ml-1">Create Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input-field ${errors.password ? 'border-red-500/50' : ''}`}
                  />
                  {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input-field ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-400 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white hover:underline focus:outline-none"
                >
                  Sign In
                </button>
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignUpModal;
