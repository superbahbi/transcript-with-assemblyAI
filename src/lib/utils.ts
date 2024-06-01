import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
