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

      {/* Right side - Interactive Working Mockup */}
      <div className="hidden lg:block relative flex-1 bg-zinc-50 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-200/30 blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-200/20 blur-3xl"
          />
        </div>

        {/* Mockup Container */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-4xl h-[600px] bg-white rounded-[32px] shadow-2xl shadow-indigo-200/40 border border-white/50 flex overflow-hidden group"
          >
            {/* Mock Sidebar */}
            <div className="w-20 border-r border-zinc-100 bg-zinc-50/30 flex flex-col items-center py-8 gap-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${i === 1 ? 'bg-white shadow-sm border border-zinc-200 text-indigo-600' : 'text-zinc-400'}`}>
                  <div className={`w-5 h-5 rounded ${i === 1 ? 'bg-indigo-600/10' : 'bg-zinc-200'} `} />
                </div>
              ))}
            </div>

            {/* Mock Main Content */}
            <div className="flex-1 flex flex-col bg-white">
              <header className="h-20 border-b border-zinc-100 flex items-center justify-between px-8">
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-zinc-100 rounded-lg animate-pulse" />
                  <div className="h-3 w-48 bg-zinc-50 rounded-lg" />
                </div>
                <div className="h-10 w-32 bg-indigo-600/5 border border-indigo-600/20 rounded-xl flex items-center justify-center gap-2 px-4 shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-indigo-600/20" />
                  <div className="h-2 w-16 bg-indigo-600/20 rounded-full" />
                </div>
              </header>

              <div className="flex-1 p-8 grid grid-cols-5 gap-8">
                {/* Mock Note Detail */}
                <div className="col-span-3 space-y-8">
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 1, delay: 1 }}
                      className="h-8 bg-zinc-900/5 rounded-xl"
                    />
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + i * 0.1 }}
                          className={`h-3 bg-zinc-100 rounded-full ${i === 3 ? 'w-2/3' : 'w-full'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Active Visualizer Mock */}
                  <div className="h-56 bg-zinc-50 border border-zinc-100 rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-indigo-600 rotate-[-45deg]" />
                      </div>
                      <div className="h-3 w-24 bg-indigo-600/10 rounded-full" />
                    </div>
                    
                    <div className="flex items-end gap-2 h-24">
                      {[40, 70, 45, 90, 65, 80, 55, 75, 50, 85].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ 
                            duration: 0.8, 
                            delay: 1.5 + i * 0.05,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                          }}
                          className="flex-1 bg-indigo-600/20 rounded-t-md"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mock Note List */}
                <div className="col-span-2 space-y-4">
                  <div className="h-4 w-20 bg-zinc-100 rounded-lg mb-6" />
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={`p-4 rounded-xl border border-zinc-100 shadow-sm flex items-start gap-3 ${i === 1 ? 'bg-indigo-50/30 border-indigo-100 ring-1 ring-indigo-50' : 'bg-white'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${i === 1 ? 'bg-indigo-600/10' : 'bg-zinc-100'}`} />
                      <div className="space-y-2 flex-1">
                        <div className={`h-2.5 rounded-full ${i === 1 ? 'bg-indigo-600/20 w-3/4' : 'bg-zinc-200 w-1/2'}`} />
                        <div className="h-2 w-full bg-zinc-100 rounded-full" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hover Floating Overlay */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 -right-12 bg-white p-6 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.15)] border border-indigo-50 w-64 z-20 group-hover:translate-x-4 transition-transform duration-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div>
                  <div className="h-2.5 w-24 bg-zinc-900 rounded-full mb-1.5" />
                  <div className="h-2 w-16 bg-zinc-400 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-zinc-100 rounded-full" />
                <div className="h-2 w-5/6 bg-zinc-100 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
