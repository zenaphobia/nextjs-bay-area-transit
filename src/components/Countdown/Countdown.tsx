"use client";
import { memo, useEffect, useState } from "react";
import "./styles.css";
import { twJoin } from "tailwind-merge";

type Fragment = "days" | "hours" | "minutes" | "seconds";
type Time = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type CountdownProps = {
  target: Date | string;
  fragment: Fragment[];
  labels?: boolean;
  onDone?: () => void;
};

const Countdown = memo(function Countdown({
  target,
  fragment,
  labels = false,
  onDone,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<Time>(() => {
    const targetDate = typeof target === "string" ? new Date(target) : target;
    const distance = targetDate.getTime() - Date.now();

    if (distance <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  });

  const timerDone =
    timeLeft.days + timeLeft.hours + timeLeft.minutes + timeLeft.seconds === 0;

  useEffect(() => {
    const targetDate = typeof target === "string" ? new Date(target) : target;

    function calcTimeLeft(): Time {
      const distance = targetDate.getTime() - Date.now();

      if (distance <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      };
    }

    const intervalID = setInterval(() => {
      const remaining = calcTimeLeft();
      setTimeLeft(remaining);

      if (
        remaining.days +
          remaining.hours +
          remaining.minutes +
          remaining.seconds ===
        0
      ) {
        clearInterval(intervalID);
        onDone?.();
      }
    }, 1000);

    return () => {
      clearInterval(intervalID);
    };
  }, [target]);

  return (
    timeLeft && (
      <div
        className={twJoin(
          "bg-secondary/75 text-primary grid items-center -mr-6 auto-cols-max grid-flow-col p-4 text-center font-bold transition-opacity",
          timerDone && "opacity-25",
        )}
      >
        {fragment.includes("days") && (
          <>
            <div className="flex flex-col">
              <span className="countdown text-3xl">
                <span
                  style={{ "--value": timeLeft.days } as React.CSSProperties}
                  aria-live="polite"
                >
                  {timeLeft.days}
                </span>
              </span>
              {labels && <span>Days</span>}
            </div>
            {fragment.includes("hours") && <span className="text-4xl">:</span>}
          </>
        )}
        {fragment.includes("hours") && (
          <>
            <div className="flex flex-col">
              <span className="countdown text-3xl">
                <span
                  style={{ "--value": timeLeft.hours } as React.CSSProperties}
                  aria-live="polite"
                >
                  {timeLeft.hours}
                </span>
              </span>
              {labels && <span>Hours</span>}
            </div>
            {fragment.includes("minutes") && (
              <span className="text-4xl">:</span>
            )}
          </>
        )}
        {fragment.includes("minutes") && (
          <>
            <div className="flex flex-col">
              <span className="countdown text-3xl">
                <span
                  style={{ "--value": timeLeft.minutes } as React.CSSProperties}
                  aria-live="polite"
                >
                  {timeLeft.minutes}
                </span>
              </span>
              {labels && <span>Minutes</span>}
            </div>
            {fragment.includes("seconds") && (
              <span className="text-4xl">:</span>
            )}
          </>
        )}
        {fragment.includes("seconds") && (
          <div className="flex flex-col">
            <span className="countdown text-3xl">
              <span
                style={{ "--value": timeLeft.seconds } as React.CSSProperties}
                aria-live="polite"
              >
                {timeLeft.seconds}
              </span>
            </span>
            {labels && <span>Seconds</span>}
          </div>
        )}
      </div>
    )
  );
});

export default Countdown;
