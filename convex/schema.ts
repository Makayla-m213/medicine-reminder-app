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
  }).index("by_student", ["studentId"]),

  // NOTES table
  notes: defineTable({
    studentId: v.id("students"),
    teacherId: v.string(),
    content: v.string(),
    concern: v.boolean(),
    timestamp: v.string(),
  }).index("by_student", ["studentId"]),

  // PARENTS table (ADD THIS)
  parents: defineTable({
    email: v.string(),
    fullName: v.string(),
    password: v.string(), // In production, hash this!
    role: v.string(),
    createdAt: v.string(),
  }).index("by_email", ["email"]),

  // TEACHERS table (ADD THIS)
  teachers: defineTable({
    email: v.string(),
    fullName: v.string(),
    password: v.string(), // In production, hash this!
    role: v.string(),
    createdAt: v.string(),
  }).index("by_email", ["email"]),

  // PARENT-CHILD relationship (ADD THIS)
  parentChildren: defineTable({
    parentId: v.id("parents"),
    studentId: v.id("students"),
    relationship: v.string(), // e.g., "father", "mother", "guardian"
  }).index("by_parent", ["parentId"])
   .index("by_student", ["studentId"]),
});