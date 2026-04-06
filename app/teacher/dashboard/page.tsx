'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  // ✅ HOOKS AT THE TOP
  const students = useQuery(api.students.getAllStudents);

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      router.push('/teacher/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'teacher') {
      router.push('/teacher/login');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  // ✅ Loading state AFTER hooks
  if (!user) return null;
  
  if (students === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/teacher/login');
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl">👩‍🏫</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medicine Reminder</h1>
                <p className="text-sm text-gray-600">Teacher Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <p className="text-center text-gray-700 font-medium">{today}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Students</p>
            <p className="text-3xl font-bold text-purple-600">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Active Today</p>
            <p className="text-3xl font-bold text-green-600">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Monitoring</p>
            <p className="text-3xl font-bold text-blue-600">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Notes Added</p>
            <p className="text-3xl font-bold text-orange-600">0</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Students ({students.length})</h2>
          
          {students.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">No students found</p>
              <p className="text-gray-400 text-sm mt-2">Run seedData to add students</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <div
                  key={student._id}
                  onClick={() => router.push(`/teacher/student/${student._id}`)}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.grade} • Age {student.age}</p>
                    </div>
                    <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{student.medicalNotes}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-3">
                    <span className="text-gray-600">Parent: {student.parentName}</span>
                    <span className="text-purple-600 font-medium">View Details →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800">
            💡 <strong>Note:</strong> You have read-only access. You can view student schedules and add observation notes, but cannot modify prescriptions.
          </p>
        </div>
      </main>
    </div>
  );
}