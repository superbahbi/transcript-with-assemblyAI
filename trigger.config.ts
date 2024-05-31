import type { TriggerConfig } from "@trigger.dev/sdk/v3";

export const config: TriggerConfig = {
  project: "proj_fcebfvqmewuudkvsinny",
  logLevel: "log",
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 0,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  triggerDirectories: ["src/trigger"],
};
