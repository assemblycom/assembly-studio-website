"use client";

import { useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";

export function CTA() {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm text-muted-foreground">AI App Builder</p>
        <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-5xl">
          Ready to build?
        </h2>
        <div className="mx-auto mt-10 max-w-2xl">
          <div
            onClick={() => inputRef.current?.focus()}
            className={`cursor-text rounded-2xl border bg-muted p-6 text-left transition-colors ${
              focused
                ? "border-foreground/30"
                : "border-border hover:border-foreground/20"
            }`}
          >
            <div className="relative">
              {!input && (
                <span
                  className="pointer-events-none absolute left-0 top-0 text-muted-foreground"
                  aria-hidden="true"
                >
                  Describe what you want to build...
                </span>
              )}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && input.trim()) window.open(APP_URL);
                }}
                className="w-full bg-transparent text-foreground/80 caret-foreground/70 outline-none"
                aria-label="Describe what you want to build"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="mt-12 flex items-center justify-end">
              <a
                href={APP_URL}
                onClick={(e) => e.stopPropagation()}
                className="rounded-full bg-foreground px-5 py-2 text-sm text-background transition-opacity hover:opacity-90"
              >
                Start building
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
