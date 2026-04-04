import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all prescriptions for a specific student
export const getPrescriptionsByStudent = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prescriptions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

// Add a new prescription (Parent would do this)
export const addPrescription = mutation({
  args: {
    studentId: v.id("students"),
    title: v.string(),
    dosage: v.string(),
    time: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("missed")
    ),
    dateLogged: v.string(),
  },
  handler: async (ctx, args) => {
    const prescriptionId = await ctx.db.insert("prescriptions", {
      studentId: args.studentId,
      title: args.title,
      dosage: args.dosage,
      time: args.time,
      status: args.status,
      dateLogged: args.dateLogged,
    });
    return prescriptionId;
  },
});

// Update prescription status (completed/missed)
export const updatePrescriptionStatus = mutation({
  args: {
    prescriptionId: v.id("prescriptions"),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("missed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prescriptionId, {
      status: args.status,
    });
  },
});