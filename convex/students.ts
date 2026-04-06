import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all students
export const getAllStudents = query({
  handler: async (ctx) => {
    return await ctx.db.query("students").collect();
  },
});

// Get a single student by ID
export const getStudentById = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studentId);
  },
});

// Add a new student
export const addStudent = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    grade: v.string(),
    parentName: v.string(),
    parentContact: v.string(),
    medicalNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const studentId = await ctx.db.insert("students", {
      name: args.name,
      age: args.age,
      grade: args.grade,
      parentName: args.parentName,
      parentContact: args.parentContact,
      medicalNotes: args.medicalNotes,
    });
    return studentId;
  },
});

// ✅ ADD THIS - Edit student
export const editStudent = mutation({
  args: {
    studentId: v.id("students"),
    name: v.string(),
    age: v.number(),
    grade: v.string(),
    parentName: v.string(),
    parentContact: v.string(),
    medicalNotes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.studentId, {
      name: args.name,
      age: args.age,
      grade: args.grade,
      parentName: args.parentName,
      parentContact: args.parentContact,
      medicalNotes: args.medicalNotes,
    });
    return { success: true };
  },
});

// Delete a student and all related data
export const deleteStudent = mutation({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    // 1. Delete all prescriptions for this student
    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
    
    for (const prescription of prescriptions) {
      await ctx.db.delete(prescription._id);
    }
    
    // 2. Delete all notes for this student
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
    
    for (const note of notes) {
      await ctx.db.delete(note._id);
    }
    
    // 3. Delete parent-child relationships
    const parentLinks = await ctx.db
      .query("parentChildren")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
    
    for (const link of parentLinks) {
      await ctx.db.delete(link._id);
    }
    
    // 4. Delete the student
    await ctx.db.delete(args.studentId);
    
    return { success: true };
  },
});