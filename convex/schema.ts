import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // STUDENTS table
  students: defineTable({
    name: v.string(),
    age: v.number(),
    grade: v.string(),
    parentName: v.string(),
    parentContact: v.string(),
    medicalNotes: v.string(),
  }),

  // PRESCRIPTIONS table
  prescriptions: defineTable({
    studentId: v.id("students"), // Foreign key to students table
    title: v.string(), // Medicine name
    dosage: v.string(),
    time: v.string(), // Scheduled time (e.g., "10:00 AM")
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("missed")
    ),
    dateLogged: v.string(), // ISO date string
  }).index("by_student", ["studentId"]), // Index for fast lookups by student

  // NOTES table
  notes: defineTable({
    studentId: v.id("students"), // Foreign key to students table
    teacherId: v.string(), // Who wrote the note
    content: v.string(),
    concern: v.boolean(), // Is this flagged as a concern?
    timestamp: v.string(), // ISO date string
  }).index("by_student", ["studentId"]), // Index for fast lookups by student
});