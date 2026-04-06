import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or login teacher
export const teacherLogin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if teacher exists
    const existingTeacher = await ctx.db
      .query("teachers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingTeacher) {
      // Login existing teacher
      if (existingTeacher.password !== args.password) {
        throw new Error("Invalid password");
      }
      return {
        success: true,
        user: {
          id: existingTeacher._id,
          email: existingTeacher.email,
          fullName: existingTeacher.fullName,
          role: existingTeacher.role,
        }
      };
    }
    
    // Create new teacher account
    const teacherId = await ctx.db.insert("teachers", {
      email: args.email,
      fullName: args.email.split('@')[0],
      password: args.password,
      role: "teacher",
      createdAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      user: {
        id: teacherId,
        email: args.email,
        fullName: args.email.split('@')[0],
        role: "teacher",
      }
    };
  },
});

// Get all teachers
export const getAllTeachers = query({
  handler: async (ctx) => {
    return await ctx.db.query("teachers").collect();
  },
});