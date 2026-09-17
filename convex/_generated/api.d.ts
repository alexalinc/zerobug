/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as companies from "../companies.js";
import type * as crons from "../crons.js";
import type * as invoices from "../invoices.js";
import type * as invoicesActions from "../invoicesActions.js";
import type * as invoicesBilling from "../invoicesBilling.js";
import type * as leads from "../leads.js";
import type * as settings from "../settings.js";
import type * as stripe from "../stripe.js";
import type * as stripeWebhook from "../stripeWebhook.js";
import type * as subscriptions from "../subscriptions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  companies: typeof companies;
  crons: typeof crons;
  invoices: typeof invoices;
  invoicesActions: typeof invoicesActions;
  invoicesBilling: typeof invoicesBilling;
  leads: typeof leads;
  settings: typeof settings;
  stripe: typeof stripe;
  stripeWebhook: typeof stripeWebhook;
  subscriptions: typeof subscriptions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
