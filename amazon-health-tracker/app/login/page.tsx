'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          email, password, redirect: false,
        });
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Welcome back!');
          router.push('/dashboard');
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, organizationName: orgName }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Account created! Signing in...');
          const result = await signIn('credentials', { email, password, redirect: false });
          if (!result?.error) router.push('/dashboard');
        } else {
          toast.error(data.error || 'Registration failed');
        }
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ff6b2b]/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#3b82f6]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff6b2b] to-[#ffb347] items-center justify-center shadow-lg shadow-[#ff6b2b]/20 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Account Health Tracker</h1>
          <p className="text-sm text-[#64748b]">Amazon seller account monitoring</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1f2d45] rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex bg-[#0a0e17] rounded-xl p-1 mb-2">
            <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-[#ff6b2b] text-white shadow-lg' : 'text-[#64748b]'}`}>
              Sign In
            </button>
            <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-[#ff6b2b] text-white shadow-lg' : 'text-[#64748b]'}`}>
              Register
            </button>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="text-xs font-semibold text-[#94a3b8] mb-1.5 block">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1f2d45] rounded-xl text-sm text-[#e2e8f0] focus:border-[#ff6b2b] focus:outline-none" placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#94a3b8] mb-1.5 block">Agency Name</label>
                <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1f2d45] rounded-xl text-sm text-[#e2e8f0] focus:border-[#ff6b2b] focus:outline-none" placeholder="Your agency name" />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-[#94a3b8] mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1f2d45] rounded-xl text-sm text-[#e2e8f0] focus:border-[#ff6b2b] focus:outline-none" placeholder="you@agency.com" />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#94a3b8] mb-1.5 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1f2d45] rounded-xl text-sm text-[#e2e8f0] focus:border-[#ff6b2b] focus:outline-none" placeholder="••••••••" />
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>

          {isLogin && (
            <p className="text-center text-xs text-[#64748b]">
              Demo: <span className="text-[#94a3b8]">admin@amplicomm.com</span> / <span className="text-[#94a3b8]">password123</span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
