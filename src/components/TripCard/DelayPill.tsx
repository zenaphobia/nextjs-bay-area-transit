import { memo } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  delay: string | number | undefined;
  className?: string;
};

const DelayPill = memo(function DelayPill({ delay, className }: Props) {
  if (!delay) return null;

  return (
    <span
      className={twMerge(
        "px-2 text-xs rounded-full bg-red-900 font-bold",
        className,
      )}
    >
      {typeof delay === "number" ? `+${delay} MIN` : delay}
    </span>
  );
});

export default DelayPill;
