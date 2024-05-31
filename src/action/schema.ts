import { z } from "zod";

export const transcribeSchema = z.object({
  audio_url: z.string(),
});
