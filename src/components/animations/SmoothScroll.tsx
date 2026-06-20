"use client";

/**
 * Smooth scrolling is handled natively via CSS (`scroll-behavior: smooth`)
 * in globals.css. We intentionally do NOT hijack the wheel event with JS —
 * that previously caused broken/laggy scrolling. This component is a no-op
 * kept only for backwards compatibility with existing imports.
 */
export default function SmoothScroll() {
  return null;
}
