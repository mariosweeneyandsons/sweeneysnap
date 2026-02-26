/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accessRequests from "../accessRequests.js";
import type * as adminProfiles from "../adminProfiles.js";
import type * as aiModeration from "../aiModeration.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as brandAssets from "../brandAssets.js";
import type * as crewActivityLog from "../crewActivityLog.js";
import type * as crewLib from "../crewLib.js";
import type * as crewMembers from "../crewMembers.js";
import type * as crons from "../crons.js";
import type * as delivery from "../delivery.js";
import type * as deliveryMutations from "../deliveryMutations.js";
import type * as eventScheduler from "../eventScheduler.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as imageProcessing from "../imageProcessing.js";
import type * as lib from "../lib.js";
import type * as multiEventDisplays from "../multiEventDisplays.js";
import type * as presets from "../presets.js";
import type * as printJobs from "../printJobs.js";
import type * as selfies from "../selfies.js";
import type * as sessions from "../sessions.js";
import type * as systemHealth from "../systemHealth.js";
import type * as validators from "../validators.js";
import type * as webhookDispatch from "../webhookDispatch.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accessRequests: typeof accessRequests;
  adminProfiles: typeof adminProfiles;
  aiModeration: typeof aiModeration;
  analytics: typeof analytics;
  auth: typeof auth;
  brandAssets: typeof brandAssets;
  crewActivityLog: typeof crewActivityLog;
  crewLib: typeof crewLib;
  crewMembers: typeof crewMembers;
  crons: typeof crons;
  delivery: typeof delivery;
  deliveryMutations: typeof deliveryMutations;
  eventScheduler: typeof eventScheduler;
  events: typeof events;
  http: typeof http;
  imageProcessing: typeof imageProcessing;
  lib: typeof lib;
  multiEventDisplays: typeof multiEventDisplays;
  presets: typeof presets;
  printJobs: typeof printJobs;
  selfies: typeof selfies;
  sessions: typeof sessions;
  systemHealth: typeof systemHealth;
  validators: typeof validators;
  webhookDispatch: typeof webhookDispatch;
  webhooks: typeof webhooks;
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
