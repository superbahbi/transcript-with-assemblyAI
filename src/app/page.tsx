"use client";

import { transcribeSchema } from "@/action/schema";
import { transcribeAction } from "@/action/transcribe-action";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { parseAsBoolean, parseAsStringEnum, useQueryStates } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function Home() {
  const [eventId, setEventId] = useState<string>();
  const [params, setParams] = useQueryStates({
    step: parseAsStringEnum(["overview", "error"]),
    error: parseAsBoolean,
  });

  const { step, error } = params;

  const isOpen = step === "overview" && !error;

  const transcribe = useAction(transcribeAction, {
    onError: () => {
      // toast("Something went wrong pleaase try again.");
      console.log("Something went wrong please try again.");
    },
    onSuccess: (data) => {
      setParams({
        step: "overview",
      });
      if (data.id) {
        console.log("data.id", data.id);
        setEventId(data.id);
      }
      console.log(data);
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
  return (
    <div className="w-full grid min-h-screen">
      <div className="flex items-center justify-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mx-auto max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Transcribes audio using assemblyai
                </CardTitle>
                {/* <CardDescription>Enter your audio url</CardDescription> */}
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
      </div>
      {eventId && (
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
      )}
    </div>
  );
}
