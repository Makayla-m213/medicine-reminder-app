'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">💊</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Reminder</h1>
        <p className="text-gray-600 mb-8">Smart medication tracking for children</p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/parent/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            👨‍👩‍👧 Parent Portal
          </button>
          <button
            onClick={() => router.push('/teacher/login')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
          >
            👩‍🏫 Teacher Portal
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-8">
          Your child's medication, simplified
        </p>
      </div>
    </div>
  );
}