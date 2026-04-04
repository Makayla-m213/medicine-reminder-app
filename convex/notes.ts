import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all notes for a specific student
export const getNotesByStudent = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .order("desc") // Newest first
      .collect();
  },
});

// Add a new note (Teacher would do this)
export const addNote = mutation({
  args: {
    studentId: v.id("students"),
    teacherId: v.string(),
    content: v.string(),
    concern: v.boolean(),
  },
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("notes", {
      studentId: args.studentId,
      teacherId: args.teacherId,
      content: args.content,
      concern: args.concern,
      timestamp: new Date().toISOString(),
    });
    return noteId;
  },
});

// Delete a note (if needed)
export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.noteId);
  },
});