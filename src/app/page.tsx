"use client";

import { transcribeSchema } from "@/action/schema";
import {
  continueConversation,
  transcribeAction,
} from "@/action/transcribe-action";
import { ChatEmpty } from "@/components/chat-empty";
import { ChatList } from "@/components/chat-list";
import { LoadingTransactionsEvent } from "@/components/loading-transactions-event";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { CoreMessage } from "ai";
import { readStreamableValue } from "ai/rsc";
import { useScrollAnchor } from "hooks/use-scroll-anchor";
import { useAction } from "next-safe-action/hooks";
import { parseAsBoolean, parseAsStringEnum, useQueryStates } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  const [eventId, setEventId] = useState<string>();
  const [params, setParams] = useQueryStates({
    step: parseAsStringEnum(["overview", "error"]),
    error: parseAsBoolean,
  });
  const [transcript, setTranscript] = useState<any>();
  const [clips, setClips] = useState<any[]>([]);
  const [messages, setMessages] = useState<CoreMessage[]>([]);

  const { step, error } = params;

  const isOpen = step === "overview" && !error;

  const transcribe = useAction(transcribeAction, {
    onError: () => {
      // toast("Something went wrong pleaase try again.");
      console.log("Something went wrong please try again.");
    },
    onSuccess: async (data) => {
      setTranscript(data);
      const newMessages: CoreMessage[] = [
        ...messages,
        {
          content: `You are a TikTok content creator with exceptional skills and a passion for making engaging short clips. Creating these clips brings you immense joy.
           Given the following content, your task is to extract all the interesting segments that are 60 seconds long. Each clip should be an exact quote.
          Here is the content for extraction: ${data?.text}
           Respond only with the JSON object containing the "clip" property.`,
          role: "user",
        },
      ];

      const result = await continueConversation(newMessages);

      for await (const content of readStreamableValue(result.message)) {
        setMessages([
          {
            role: "assistant",
            content: content as string,
          },
        ]);
      }
    },
  });
  const form = useForm<z.infer<typeof transcribeSchema>>({
    resolver: zodResolver(transcribeSchema),
    defaultValues: {
      audio_url: "",
    },
  });
  async function onSubmit(values: z.infer<typeof transcribeSchema>) {
    transcribe.execute(values);
  }

  const onClose = () => {
    setParams(
      { step: null },
      {
        // NOTE: Rerender so the overview modal is visible
        shallow: false,
      },
    );
  };
  const { messagesRef, scrollRef, visibilityRef, scrollToBottom } =
    useScrollAnchor();

  return (
    <div className="w-full grid min-h-screen">
      <div className="flex flex-col items-center justify-center">
        <div className="max-w-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="mx-auto max-w-md">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Transcribes audio to clips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="audio_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audio Url</FormLabel>
                            <FormControl>
                              <Input
                                id="audio_url"
                                type="text"
                                required
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={transcribe.status === "executing"}
                    >
                      Transcribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>

          <div>
            {transcript && (
              <Sheet>
                <Button asChild variant="outline" className="mt-4">
                  <SheetTrigger className="">Show Transcript</SheetTrigger>
                </Button>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Transcript</SheetTitle>
                    <SheetDescription>{transcript.text}</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            )}
          </div>
          {messages.length > 0 && (
            <>
              {" "}
              <Separator className="my-4" />
              <Card className="overflow-hidden p-0 max-w-md">
                <ScrollArea className="h-[480px]" ref={scrollRef}>
                  <div ref={messagesRef}>
                    <ChatList messages={messages} />
                    <div className="w-full h-px" ref={visibilityRef} />
                  </div>
                </ScrollArea>
              </Card>
            </>
          )}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          onPointerDownOutside={(event: any) => event.preventDefault()}
          onEscapeKeyDown={(event: any) => event.preventDefault()}
        >
          <LoadingTransactionsEvent
            eventId={eventId}
            setEventId={setEventId}
            onClose={onClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
