"use client";

import { cn } from "@/lib/utils";
import { useEventDetails, useEventRunStatuses } from "@trigger.dev/react";
import Lottie from "lottie-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
export function LoadingTransactionsEvent({
  eventId,
  setEventId,
  onClose,
}: {
  eventId: string;
  setEventId: (eventId: string | undefined) => void;
  onClose: () => void;
}) {
  const { statuses } = useEventRunStatuses(eventId); // not working for now waiting for trigger.dev to implement this feature

  const status = statuses?.at(0);
  const [step, setStep] = useState(1);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (status?.data?.step) {
      if (status.data.step === "getting_transcript") {
        setStep(2);
      }
      if (status.data.step === "getting_highlights") {
        setStep(3);
      }
      if (status.data.step === "making_clips") {
        setStep(4);
      }
      if (status.data.step === "completed") {
        setStep(5);
        setTimeout(() => {
          onClose();
        }, 500);

        setTimeout(() => {
          setEventId(undefined);
        }, 1000);
      }
    }
  }, [status]);

  return (
    <div className="h-[300px]">
      <Lottie
        className="mb-6"
        animationData={
          resolvedTheme === "dark"
            ? require("public/assets/writing-animation.json")
            : require("public/assets/writing-animation.json")
        }
        loop={true}
        style={{ width: 50, height: 50 }}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
      />
      <h2 className="mb-8 text-lg font-semibold leading-none tracking-tight">
        Transcribing your audio
      </h2>

      <ul className="text-md space-y-4 text-[#878787] transition-all">
        <li
          className={cn(
            "opacity-50 dark:opacity-20",
            step > 0 && "!opacity-100",
          )}
        >
          Downloading audio
          {step === 1 && <span className="loading-ellipsis" />}
        </li>
        <li
          className={cn(
            "opacity-50 dark:opacity-20",
            step > 1 && "!opacity-100",
          )}
        >
          Get transcript
          {step === 2 && <span className="loading-ellipsis" />}
        </li>
        <li
          className={cn(
            "opacity-50 dark:opacity-20",
            step > 2 && "!opacity-100",
          )}
        >
          Get highlights
          {step === 3 && <span className="loading-ellipsis" />}
        </li>
        <li
          className={cn(
            "opacity-50 dark:opacity-20",
            step > 3 && "!opacity-100",
          )}
        >
          Making clips
          {step === 4 && <span className="loading-ellipsis" />}
        </li>
      </ul>
    </div>
  );
}
