import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or login parent
export const parentLogin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if parent exists
    const existingParent = await ctx.db
      .query("parents")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingParent) {
      if (existingParent.password !== args.password) {
        throw new Error("Invalid password");
      }
      return {
        success: true,
        user: {
          id: existingParent._id,
          email: existingParent.email,
          fullName: existingParent.fullName,
          role: existingParent.role,
        }
      };
    }
    
    // Create new parent account
    const parentId = await ctx.db.insert("parents", {
      email: args.email,
      fullName: args.email.split('@')[0],
      password: args.password,
      role: "parent",
      createdAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      user: {
        id: parentId,
        email: args.email,
        fullName: args.email.split('@')[0],
        role: "parent",
      }
    };
  },
});

// Get parent's children
export const getParentChildren = query({
  args: { parentId: v.id("parents") },
  handler: async (ctx, args) => {
    const relationships = await ctx.db
      .query("parentChildren")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();
    
    const children = [];
    for (const rel of relationships) {
      const student = await ctx.db.get(rel.studentId);
      if (student) {
        children.push({
          ...student,
          relationship: rel.relationship,
        });
      }
    }
    return children;
  },
});

// ADD THIS - Link parent to child
export const linkParentToChild = mutation({
  args: {
    parentId: v.id("parents"),
    studentId: v.id("students"),
    relationship: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if link already exists
    const existing = await ctx.db
      .query("parentChildren")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();
    
    const alreadyLinked = existing.some(link => link.studentId === args.studentId);
    
    if (!alreadyLinked) {
      await ctx.db.insert("parentChildren", {
        parentId: args.parentId,
        studentId: args.studentId,
        relationship: args.relationship,
      });
    }
    
    return { success: true };
  },
});