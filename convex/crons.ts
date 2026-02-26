import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "check-event-schedules",
  { minutes: 1 },
  internal.eventScheduler.checkAndToggleEvents
);

export default crons;
