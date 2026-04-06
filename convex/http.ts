import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// GET endpoint for wearable to fetch schedules
http.route({
  path: "/wearable/schedules",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const deviceId = url.searchParams.get("deviceId");

    if (!deviceId) {
      return new Response(
        JSON.stringify({ success: false, error: "deviceId required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const allPrescriptions = await ctx.runQuery(api.prescriptions.getAllPrescriptions);
      const allStudents = await ctx.runQuery(api.students.getAllStudents);
      
      // Format for Wayne's device
      const reminders = allPrescriptions.map((prescription: any) => {
        const student = allStudents.find((s: any) => s._id === prescription.studentId);
        return {
          time: prescription.time.replace(":", ""), // Convert "10:00" to "1000"
          med: prescription.title,
          status: prescription.status.toUpperCase(),
        };
      });

      return new Response(
        JSON.stringify({ 
          deviceID: deviceId,
          reminders: reminders
        }),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch schedules" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// POST endpoint for wearable to send intake logs
http.route({
  path: "/wearable/sync",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { deviceID, reminders } = body;

      if (!deviceID) {
        return new Response(
          JSON.stringify({ success: false, error: "deviceID required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      let recordsProcessed = 0;

      // Process each reminder
      if (reminders && Array.isArray(reminders)) {
        for (const reminder of reminders) {
          try {
            // Find prescription by medicine name and time
            const allPrescriptions = await ctx.runQuery(api.prescriptions.getAllPrescriptions);
            const matchingPrescription = allPrescriptions.find((p: any) => {
              const formattedTime = p.time.replace(":", "");
              return p.title === reminder.med && formattedTime === reminder.time;
            });

            if (matchingPrescription) {
              // Map Wayne's status to your status (must be one of: "pending", "completed", "missed")
              let finalStatus: "pending" | "completed" | "missed" = "pending";
              if (reminder.status === "TAKEN") finalStatus = "completed";
              if (reminder.status === "SKIPPED") finalStatus = "missed";
              
              await ctx.runMutation(api.prescriptions.updatePrescriptionStatus, {
                prescriptionId: matchingPrescription._id,
                status: finalStatus,
              });
              recordsProcessed++;
            }
          } catch (err) {
            console.error("Error processing reminder:", err);
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Sync successful",
          recordsProcessed,
        }),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    } catch (error) {
      console.error("Sync error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Sync failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;