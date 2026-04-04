'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockChildren, mockDevices, mockPrescriptions, mockSchedules, mockIntakeLogs, User } from '@/lib/mock-data';

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      router.push('/parent/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  // Get child data
  const child = mockChildren.find(c => c.parentId === user.id);
  const device = child ? mockDevices.find(d => d.childId === child.id) : null;
  const prescriptions = child ? mockPrescriptions.filter(p => p.childId === child.id) : [];
  
  // Get today's logs
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = mockIntakeLogs.filter(log => log.scheduledTime.startsWith(today));
  const takenCount = todayLogs.filter(log => log.status === 'taken').length;
  const totalCount = todayLogs.length;
  const compliance = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/parent/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl">💊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medicine Reminder</h1>
                <p className="text-sm text-gray-600">Parent Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-600">Parent</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Info Card */}
        {child && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Child Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{child.firstName} {child.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-semibold text-gray-900">{child.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Medical Notes</p>
                <p className="font-semibold text-gray-900">{child.medicalNotes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Device Status Card */}
        {device && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Wearable Device Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Serial Number</p>
                <p className="font-semibold text-gray-900">{device.deviceSerial}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Battery Level</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${device.batteryLevel > 50 ? 'bg-green-500' : device.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${device.batteryLevel}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{device.batteryLevel}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lock Status</p>
                <p className="font-semibold text-gray-900">
                  {device.isLocked ? '🔒 Locked' : '🔓 Unlocked'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Sync</p>
                <p className="font-semibold text-gray-900">
                  {new Date(device.lastSync).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Compliance */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today&apos;s Compliance</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${compliance}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{compliance}%</p>
              <p className="text-sm text-gray-600">{takenCount}/{totalCount} doses taken</p>
            </div>
          </div>
        </div>

        {/* Active Prescriptions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Prescriptions</h2>
          <div className="space-y-4">
            {prescriptions.map((prescription) => {
              const schedules = mockSchedules.filter(s => s.prescriptionId === prescription.id);
              return (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{prescription.medicineName}</h3>
                      <p className="text-sm text-gray-600">{prescription.dosage} • {prescription.frequency}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Instructions:</strong> {prescription.instructions}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {schedules.map((schedule) => (
                      <span key={schedule.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {schedule.scheduledTime}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {mockIntakeLogs.slice(0, 5).map((log) => {
              const schedule = mockSchedules.find(s => s.id === log.scheduleId);
              const prescription = schedule ? mockPrescriptions.find(p => p.id === schedule.prescriptionId) : null;
              
              return (
                <div key={log.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      log.status === 'taken' ? 'bg-green-100' : 
                      log.status === 'missed' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      <span className="text-xl">
                        {log.status === 'taken' ? '✓' : log.status === 'missed' ? '✗' : '⏳'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{prescription?.medicineName || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(log.scheduledTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    log.status === 'taken' ? 'bg-green-100 text-green-800' :
                    log.status === 'missed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}