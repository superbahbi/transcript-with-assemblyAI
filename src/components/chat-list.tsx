"use client";

import { ReactNode } from "react";

interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

type Props = {
  messages: any[];
};

export function ChatList({ messages }: Props) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="flex flex-col  p-4 pb-8">
      {messages.map((m, index) => (
        <div key={index}>
          {m.role === "user" ? "User: " : "AI: "}
          {m.content as string}
        </div>
      ))}
    </div>
  );
}
// {messages.map((m, i) => (
//     <div key={i} className="whitespace-pre-wrap">
//   {m.role === "user" ? "User: " : "AI: "}
//   {m.content as string}
//     </div>
//   ))}
