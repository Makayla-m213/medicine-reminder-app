import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all notes for a specific student
export const getNotesByStudent = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .collect();
  },
});

// Add a new note (Teacher does this)
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

// ✅ ADD THIS - Edit a note
export const editNote = mutation({
  args: {
    noteId: v.id("notes"),
    content: v.string(),
    concern: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.noteId, {
      content: args.content,
      concern: args.concern,
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  },
});

// ✅ UPDATE THIS - Delete a note (make it work)
export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.noteId);
    return { success: true };
  },
});