import { query } from "./_generated/server";
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