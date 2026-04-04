import { mutation } from "./_generated/server";

export const seedStudents = mutation({
  handler: async (ctx) => {
    // Delete existing data first
    const existingStudents = await ctx.db.query("students").collect();
    for (const student of existingStudents) {
      await ctx.db.delete(student._id);
    }

    const existingPrescriptions = await ctx.db.query("prescriptions").collect();
    for (const prescription of existingPrescriptions) {
      await ctx.db.delete(prescription._id);
    }

    const existingNotes = await ctx.db.query("notes").collect();
    for (const note of existingNotes) {
      await ctx.db.delete(note._id);
    }

    // Add students and get their IDs
    const alexId = await ctx.db.insert("students", {
      name: "Alex Doe",
      age: 8,
      grade: "Grade 3",
      parentName: "John Doe",
      parentContact: "+254712345678",
      medicalNotes: "Mild asthma, allergic to penicillin",
    });

    const emmaId = await ctx.db.insert("students", {
      name: "Emma Smith",
      age: 7,
      grade: "Grade 2",
      parentName: "Sarah Smith",
      parentContact: "+254787654321",
      medicalNotes: "Type 1 diabetes",
    });

    const liamId = await ctx.db.insert("students", {
      name: "Liam Johnson",
      age: 9,
      grade: "Grade 4",
      parentName: "Michael Johnson",
      parentContact: "+254798765432",
      medicalNotes: "ADHD medication required",
    });

    // Add prescriptions with CORRECT studentId references
    await ctx.db.insert("prescriptions", {
      studentId: alexId, // ← Uses the actual ID from above
      title: "Amoxicillin",
      dosage: "250mg",
      time: "10:00 AM",
      status: "completed",
      dateLogged: new Date().toISOString(),
    });

    await ctx.db.insert("prescriptions", {
      studentId: alexId, // Alex has 2 prescriptions
      title: "Vitamin D",
      dosage: "1000 IU",
      time: "02:00 PM",
      status: "pending",
      dateLogged: new Date().toISOString(),
    });

    await ctx.db.insert("prescriptions", {
      studentId: emmaId,
      title: "Insulin",
      dosage: "5 units",
      time: "09:00 AM",
      status: "completed",
      dateLogged: new Date().toISOString(),
    });

    await ctx.db.insert("prescriptions", {
      studentId: emmaId, // Emma has 2 prescriptions
      title: "Insulin",
      dosage: "5 units",
      time: "02:00 PM",
      status: "pending",
      dateLogged: new Date().toISOString(),
    });

    await ctx.db.insert("prescriptions", {
      studentId: liamId,
      title: "Ritalin",
      dosage: "10mg",
      time: "08:00 AM",
      status: "completed",
      dateLogged: new Date().toISOString(),
    });

    await ctx.db.insert("prescriptions", {
      studentId: liamId, // Liam has 2 prescriptions
      title: "Ritalin",
      dosage: "10mg",
      time: "01:00 PM",
      status: "missed",
      dateLogged: new Date().toISOString(),
    });

    // Add notes
    await ctx.db.insert("notes", {
      studentId: alexId,
      teacherId: "teacher-123",
      content: "Alex took medicine on time. No issues.",
      concern: false,
      timestamp: new Date().toISOString(),
    });

    await ctx.db.insert("notes", {
      studentId: emmaId,
      teacherId: "teacher-123",
      content: "Emma complained of dizziness after insulin. Contacted parent.",
      concern: true,
      timestamp: new Date().toISOString(),
    });

    return "✅ Re-seeded with proper ID references!";
  },
});