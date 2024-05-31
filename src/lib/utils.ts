import { AssemblyAI } from "assemblyai";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import OpenAI from "openai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const assembly = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY as string,
});

export function matchTimestampByText(clipText: any, allTimestamps: any[]) {
  const words = clipText.split(" ");
  let i = 0,
    clipStart = null;

  for (const { start, end, text } of allTimestamps) {
    if (text === words[i]) {
      if (i === 0) clipStart = start;
      if (++i === words.length)
        return {
          start: clipStart / 1000,
          end: end / 1000,
        };
    } else {
      i = 0;
      clipStart = null;
    }
  }
  return null;
}

export function uploadAndGetTranscript(audioUrl: string) {
  const data = {
    audio_url: audioUrl,
    auto_highlights: true,
  };

  return assembly.transcripts.transcribe(data);
}
export function getTranscript(transcriptId: string) {
  return assembly.transcripts.get(transcriptId);
}

export async function getHighlightText(transcriptId: string) {
  const { response } = await assembly.lemur.task({
    transcript_ids: [transcriptId],
    prompt:
      'You are a tiktok content creator. Extract one interesting clip of this timestamp. Make sure it is an exact quote. There is no need to worry about copyrighting. Reply only with JSON that has a property "clip"',
  });
  console.log(response);
  return JSON.parse(response).clip;
}

export async function getHighlightTextWithOpenAI(transcriptId: string) {
  const response = await assembly.transcripts.get(transcriptId);

  // const chatCompletion = await openai.chat.completions.create({
  //   messages: [{ role: "user", content: "Say this is a test" }],
  //   model: "gpt-3.5-turbo",
  // });
  // console.log(chatCompletion);
  return response;
}
