import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 1st of each month at 06:00 UTC (~08:00 / 09:00 Bucharest)
crons.cron(
  "monthly invoices",
  "0 6 1 * *",
  internal.invoicesBilling.runMonthlyBilling,
  {},
);

export default crons;
