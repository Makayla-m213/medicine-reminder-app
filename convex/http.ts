import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/wearable/sync",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Wearable sync received!",
        data: body,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;
