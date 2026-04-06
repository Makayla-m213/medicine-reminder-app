import { mutation } from "./_generated/server";

// RUN THIS ONCE to link existing parents to existing students
export const linkParentsToStudents = mutation({
  handler: async (ctx) => {
    // Get all parents
    const allParents = await ctx.db.query("parents").collect();
    // Get all students
    const allStudents = await ctx.db.query("students").collect();
    
    if (allParents.length === 0) {
      return "No parents found. Login as a parent first!";
    }
    
    if (allStudents.length === 0) {
      return "No students found. Run seedStudents first!";
    }
    
    let linksCreated = 0;
    
    // Link first parent to all students (for testing)
    const firstParent = allParents[0];
    
    for (const student of allStudents) {
      // Check if link already exists
      const existingLink = await ctx.db
        .query("parentChildren")
        .withIndex("by_parent", (q) => q.eq("parentId", firstParent._id))
        .collect();
      
      const alreadyLinked = existingLink.some(link => link.studentId === student._id);
      
      if (!alreadyLinked) {
        await ctx.db.insert("parentChildren", {
          parentId: firstParent._id,
          studentId: student._id,
          relationship: "parent", // or "father"/"mother"/"guardian"
        });
        linksCreated++;
      }
    }
    
    return `✅ Linked ${linksCreated} students to parent: ${firstParent.email}`;
  },
});