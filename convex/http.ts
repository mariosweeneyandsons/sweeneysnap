import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

// Print queue: GET /api/print-queue?token=xxx
http.route({
  path: "/api/print-queue",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const jobs = await ctx.runQuery(api.printJobs.getQueuedByToken, { token });
    return new Response(JSON.stringify({ jobs }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Print status: POST /api/print-status
http.route({
  path: "/api/print-status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { jobId, status, token, errorMessage } = body;

    if (!jobId || !status || !token) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify token by checking if it matches any event's print station token
    const validStatuses = ["printing", "printed", "failed"];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await ctx.runMutation(api.printJobs.updateStatus, {
      id: jobId,
      status,
      errorMessage,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
