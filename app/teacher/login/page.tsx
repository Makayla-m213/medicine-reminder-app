'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // ✅ ADD THIS - Convex mutation for teacher login
  const teacherLogin = useMutation(api.teachers.teacherLogin);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // ✅ CALL THE MUTATION - this saves to Convex
      const result = await teacherLogin({ email, password });
      
      if (result.success) {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        localStorage.setItem('userType', 'teacher');
        router.push('/teacher/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👩‍🏫</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medicine Reminder
          </h1>
          <p className="text-gray-600">Teacher Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Sign In / Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Any email works! First time? Account will be created automatically.</p>
        </div>
      </div>
    </div>
  );
}