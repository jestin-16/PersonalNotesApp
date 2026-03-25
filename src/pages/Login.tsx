import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, ArrowRight, Sparkles } from 'lucide-react';
import { motion, type Variants } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex bg-white text-zinc-900 overflow-hidden">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[48rem] lg:px-20 xl:px-24 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          <motion.div variants={itemVariants}>
            <div className="h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/20 mb-8">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-zinc-900 hover:text-zinc-700 underline underline-offset-4 transition-colors">
                Create a free account
              </Link>
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-3"
                >
                  <div className="mt-0.5">⚠️</div>
                  <div>{error}</div>
                </motion.div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-zinc-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 transition-all sm:text-sm outline-none"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 transition-all sm:text-sm outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 transition-all shadow-md shadow-zinc-900/10 mt-6 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"
                    />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:block relative flex-1 bg-zinc-50 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-zinc-100">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[40%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-zinc-200/50 to-indigo-200/30 blur-3xl"
          />
        </div>

        {/* Floating Notes/Cards */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, type: 'spring' as const }}
            className="relative w-full max-w-lg"
          >
            {/* Ambient shadow */}
            <div className="absolute inset-0 bg-white/40 blur-2xl rounded-3xl transform -rotate-3 scale-105" />
            
            {/* Main glass card */}
            <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl shadow-zinc-200/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-900/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-zinc-900 font-semibold text-lg">Your Workspace</h3>
                  <p className="text-zinc-500 text-sm">Organize thoughts beautifully</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-2.5 w-3/4 bg-zinc-200/70 rounded-full" />
                <div className="h-2.5 w-full bg-zinc-200/70 rounded-full" />
                <div className="h-2.5 w-5/6 bg-zinc-200/70 rounded-full" />
                <div className="h-2.5 w-4/6 bg-zinc-200/70 rounded-full" />
              </div>
            </div>

            {/* Smaller decorative card */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-10 -right-10 bg-white/70 backdrop-blur-md border border-white/50 p-5 rounded-2xl shadow-xl shadow-zinc-200/40 w-56"
            >
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-full bg-zinc-200 rounded-full" />
                  <div className="h-2 w-2/3 bg-zinc-200 rounded-full" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
