'use client';

import { useRouter } from 'next/navigation';
import { StudentPrescriptionStatus } from '@/lib/teacher-mock-data';

interface StudentCardProps {
  studentId: string;
  studentName: string;
  studentAge: number;
  grade: string;
  prescriptions: StudentPrescriptionStatus[];
}

export default function StudentCard({ 
  studentId, 
  studentName, 
  studentAge, 
  grade, 
  prescriptions 
}: StudentCardProps) {
  const router = useRouter();

  const completed = prescriptions.filter(p => p.status === 'completed').length;
  const pending = prescriptions.filter(p => p.status === 'pending').length;
  const missed = prescriptions.filter(p => p.status === 'missed').length;
  const total = prescriptions.length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div 
      onClick={() => router.push(`/teacher/student/${studentId}`)}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
    >
      {/* Student Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{studentName}</h3>
          <p className="text-sm text-gray-600">{grade} • Age {studentAge}</p>
        </div>
        <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
      </div>

      {/* Today's Schedule Summary */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Today&apos;s Medicines</p>
        <div className="flex gap-2">
          {prescriptions.slice(0, 3).map((prescription) => (
            <span
              key={prescription.prescriptionId}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                prescription.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : prescription.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {prescription.medicineName}
            </span>
          ))}
          {prescriptions.length > 3 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{prescriptions.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Status Counts */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-700">{completed} Done</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-gray-700">{pending} Pending</span>
          </div>
          {missed > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-700">{missed} Missed</span>
            </div>
          )}
        </div>
        <div className="text-purple-700 font-semibold">{completionRate}%</div>
      </div>
    </div>
  );
}