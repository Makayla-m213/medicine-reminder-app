'use client';

import { useState } from 'react';
import { useMutation } from "convex/react";  // ← ADD THIS
import { api } from "@/convex/_generated/api";  // ← ADD THIS
import { Id } from "@/convex/_generated/dataModel";  // ← ADD THIS
import { TeacherNote } from '@/lib/teacher-mock-data';

interface NotesSectionProps {
  studentId: Id<"students">;  // ← CHANGE THIS
  initialNotes: any[];  // Real notes from Convex
}

export default function NotesSection({ studentId, initialNotes }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [isConcern, setIsConcern] = useState(false);

  // ← ADD THIS: Mutation to add note
  const addNoteMutation = useMutation(api.notes.addNote);

  const handleAddNote = async () => {  // ← CHANGE to async
    if (!newNote.trim()) return;

    // ← CHANGE THIS: Use Convex mutation instead of localStorage
    await addNoteMutation({
      studentId,
      teacherId: 'teacher-123',  // Replace with real teacher ID from login
      content: newNote,
      concern: isConcern,
    });

    // Reset form
    setNewNote('');
    setIsConcern(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Notes & Observations</h2>

      {/* Add Note Form */}
      <div className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this student's medication or behavior..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
          rows={3}
        />
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isConcern}
              onChange={(e) => setIsConcern(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Flag as concern</span>
          </label>
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Notes List - now shows real notes from Convex */}
      <div className="space-y-3">
        {initialNotes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notes yet</p>
        ) : (
          initialNotes.map((note) => (
            <div
              key={note._id}  // ← CHANGE from note.id to note._id (Convex uses _id)
              className={`p-4 rounded-lg border ${
                note.concern
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-900">{note.content}</p>
                {note.concern && (
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full ml-2">
                    Concern
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">
                {new Date(note.timestamp).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}