'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  id: string;
  fullName: string;
  role: string;
}

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as Id<"students">;
  const [user, setUser] = useState<User | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isConcern, setIsConcern] = useState(false);

  // Get data from Convex
  const student = useQuery(api.students.getStudentById, { studentId });
  const prescriptions = useQuery(api.prescriptions.getPrescriptionsByStudent, { studentId });
  const notes = useQuery(api.notes.getNotesByStudent, { studentId });

  // Add note mutation
  const addNote = useMutation(api.notes.addNote);

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

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    await addNote({
      studentId,
      teacherId: 'teacher-123',
      content: noteText,
      concern: isConcern,
    });

    setNoteText('');
    setIsConcern(false);
  };

  // Loading state
  if (!user) return null;
  
  if (student === undefined || prescriptions === undefined || notes === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (student === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Student not found</h1>
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/teacher/dashboard')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Dashboard
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-sm text-gray-600">{student.grade} • Age {student.age}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Parent Name</p>
              <p className="font-semibold text-gray-900">{student.parentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Parent Contact</p>
              <p className="font-semibold text-gray-900">{student.parentContact}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Medical Notes</p>
              <p className="font-semibold text-gray-900">{student.medicalNotes}</p>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Prescriptions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Medicine History</h2>

            {prescriptions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No prescriptions yet</p>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{prescription.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          prescription.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : prescription.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {prescription.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Dosage: {prescription.dosage}</p>
                    <p className="text-sm text-gray-600 mb-1">Scheduled: {prescription.time}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(prescription.dateLogged).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Notes */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notes & Observations</h2>

            {/* Add Note Form */}
            <div className="mb-6">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note about this student's medication..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isConcern}
                    onChange={(e) => setIsConcern(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Flag as concern</span>
                </label>
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No notes yet</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note._id}
                    className={`p-4 rounded-lg border ${
                      note.concern ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className="text-sm text-gray-900 mb-2">{note.content}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600">
                        {new Date(note.timestamp).toLocaleString()}
                      </p>
                      {note.concern && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">
                          Concern
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}