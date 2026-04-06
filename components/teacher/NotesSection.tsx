'use client';

import { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface NotesSectionProps {
  studentId: Id<"students">;
  initialNotes: any[];
}

export default function NotesSection({ studentId, initialNotes }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [isConcern, setIsConcern] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<Id<"notes"> | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editConcern, setEditConcern] = useState(false);

  const addNoteMutation = useMutation(api.notes.addNote);
  const editNoteMutation = useMutation(api.notes.editNote);
  const deleteNoteMutation = useMutation(api.notes.deleteNote);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    await addNoteMutation({
      studentId,
      teacherId: 'teacher-123',
      content: newNote,
      concern: isConcern,
    });

    setNewNote('');
    setIsConcern(false);
  };

  const handleEditClick = (note: any) => {
    setEditingNoteId(note._id);
    setEditContent(note.content);
    setEditConcern(note.concern);
  };

  const handleSaveEdit = async () => {
    if (!editingNoteId) return;
    
    await editNoteMutation({
      noteId: editingNoteId,
      content: editContent,
      concern: editConcern,
    });
    
    setEditingNoteId(null);
    setEditContent('');
    setEditConcern(false);
  };

  const handleDeleteNote = async (noteId: Id<"notes">) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNoteMutation({ noteId });
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
    setEditConcern(false);
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-gray-900 bg-white"
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

      {/* Notes List */}
      <div className="space-y-3">
        {initialNotes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notes yet</p>
        ) : (
          initialNotes.map((note) => (
            <div
              key={note._id}
              className={`p-4 rounded-lg border ${
                note.concern
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {editingNoteId === note._id ? (
                // Edit Mode
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white mb-2"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editConcern}
                        onChange={(e) => setEditConcern(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Flag as concern</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-gray-900 flex-1">{note.content}</p>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => handleEditClick(note)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        title="Edit note"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        title="Delete note"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  {note.concern && (
                    <div className="mb-2">
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                        Concern
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(note.timestamp).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}