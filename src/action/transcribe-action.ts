"use server";

import { highlightAudio } from "@/trigger/highlight";
import { action } from "./safe-action";
import { transcribeSchema } from "./schema";
import { transcribeAudio } from "@/trigger/transcribe";

export const transcribeAction = action(
  transcribeSchema,
  async ({ audio_url }) => {
    // const handle = await transcribeAudio.trigger({ audio_url });
    const handle = await highlightAudio.trigger({
      transcriptId: "c73f1ead-5b60-4c63-bef0-86a48d28a9f5",
    });
    console.log("Task is running with handle", handle);
    return handle;
  },
);
