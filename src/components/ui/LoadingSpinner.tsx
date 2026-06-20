import React from "react";
import { clsx } from "clsx";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ size = "md", className }: Props) {
  return (
    <div
      className={clsx(
        "border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin",
        { "w-4 h-4": size === "sm", "w-6 h-6": size === "md", "w-8 h-8": size === "lg" },
        className
      )}
    />
  );
}
