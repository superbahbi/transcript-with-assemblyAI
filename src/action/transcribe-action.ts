"use server";

import { AssemblyAI, SpeechModel } from "assemblyai";
import { action } from "./safe-action";
import { transcribeSchema } from "./schema";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const assembly = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY as string,
});

export const transcribeAction = action(
  transcribeSchema,
  async ({ audio_url }) => {
    const transcript = await uploadAndGetTranscript(audio_url as string);
    // const clips = await getHighlightTextWithOpenAI(transcript.text as string);

    return transcript;
  },
);

export async function continueConversation(messages: CoreMessage[]) {
  "use server";
  const result = await streamText({
    model: openai("gpt-4o"),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return { message: stream.value };
}

function uploadAndGetTranscript(audioUrl: string) {
  const data = {
    audio_url: audioUrl,
    auto_highlights: true,
    speaker_labels: true,
    speakers_expected: 3,
    speech_model: "nano" as SpeechModel,
  };
  // TODO: check audio url if already uploaded and return the transcript id

  const transcriptId = "22c11616-86e0-4119-9f7f-074532492677";
  if (
    audioUrl ===
    "https://utfs.io/f/ea338c2f-2227-4994-8e7a-b2220b50a62c-eib52p.mp3"
  ) {
    return assembly.transcripts.get(transcriptId);
  } else {
    return assembly.transcripts.transcribe(data);
  }
}

// async function getHighlightTextWithOpenAI(transcriptText: string) {
//   const prompt = `You are a TikTok content creator with exceptional skills and a passion for making engaging short clips. Creating these clips brings you immense joy.
//   Given the following content, your task is to extract all the interesting segments that are 60 seconds long. Each clip should be an exact quote.
//   Here is the content for extraction: ${transcriptText}
//   Respond only with the JSON object containing the "clip" property.`;

//   const chatCompletion = await openai.chat.completions.create({
//     messages: [{ role: "user", content: prompt }],
//     model: "gpt-4o",
//   });

//   if (chatCompletion.choices[0]?.message.content === undefined) {
//     throw new Error("OpenAI call failed");
//   }
//   return chatCompletion.choices[0].message.content as string;
// }
