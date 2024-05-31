import { getTranscript } from "@/lib/utils";
import { logger, task } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const highlightAudio = task({
  id: "highlight-audio",
  run: async (payload: { transcriptId: string }, { ctx }) => {
    logger.log("highlight-audio!", { payload, ctx });

    const { transcriptId } = payload;

    const transcript = await getTranscript(transcriptId);

    logger.log(transcript.text as string);
    const prompt = `You are a TikTok content creator with exceptional skills and a passion for making engaging short clips. Creating these clips brings you immense joy.
    Given the following content, your task is to extract all the interesting segments that are 60 seconds long. Each clip should be an exact quote. 
    Here is the content for extraction: ${transcript.text}
    Respond only with the JSON object containing the "clip" property.`;

    //        { role: "system", content: payload.prompt },
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
    });

    if (chatCompletion.choices[0]?.message.content === undefined) {
      //sometimes OpenAI returns an empty response, let's retry by throwing an error
      throw new Error("OpenAI call failed");
    }
    logger.log("chatCompletion", {
      result: chatCompletion.choices[0].message.content as string,
    });
    return chatCompletion.choices[0].message.content;
  },
  onSuccess: async (result) => {
    logger.log("highlight-audio result", result);
  },
});
