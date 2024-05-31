import { getHighlightText, uploadAndGetTranscript } from "@/lib/utils";
import { logger, task } from "@trigger.dev/sdk/v3";

export const transcribeAudio = task({
  id: "transcribe-audio",
  run: async (payload: { audio_url: string }, { ctx }) => {
    logger.log("transcribe-audio!", { payload, ctx });

    const { audio_url } = payload;
    const transcript = await uploadAndGetTranscript(audio_url);
    logger.log("transcript", transcript);
    return {
      status: transcript.status,
    };
  },
});
