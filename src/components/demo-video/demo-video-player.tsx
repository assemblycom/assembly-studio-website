"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The demo walkthrough surface: one video with our own chrome rather than the
 * browser's, so the player reads as part of the page.
 *
 * `src` is deliberately optional. Until the launch cut is in place the page
 * still ships a real player — the controls are wired to the same element and
 * only their enabled state waits on a file, so dropping one in is a one-line
 * change with nothing left to build.
 */
export function DemoVideoPlayer({
  src,
  poster,
  className = "",
}: {
  src?: string;
  poster?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Scrubbing writes to the video on every move, which then reports the time
  // back — this keeps the thumb following the pointer rather than the events.
  const [scrubbing, setScrubbing] = useState(false);

  const ready = Boolean(src);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !ready) return;
    if (video.paused) void video.play();
    else video.pause();
  }, [ready]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video || !ready) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !ready) return;
    video.currentTime = seconds;
    setTime(seconds);
  };

  const enterFullscreen = () => {
    const video = videoRef.current;
    if (!video || !ready) return;
    // iOS Safari never implemented the standard API and only ever fullscreens
    // the video element itself, through its own method.
    if (video.requestFullscreen) void video.requestFullscreen();
    else
      (video as HTMLVideoElement & { webkitEnterFullscreen?: () => void })
        .webkitEnterFullscreen?.();
  };

  // Space and K play/pause the way every video player does, but only while the
  // player itself holds focus — the page owns the key otherwise.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== " " && e.key.toLowerCase() !== "k") return;
    e.preventDefault();
    togglePlay();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      if (!scrubbing) setTime(video.currentTime);
    };
    const onMeta = () => setDuration(video.duration || 0);
    // A cached video can reach HAVE_METADATA before this effect runs, and the
    // event only fires once — without this the clock sat at 0:00 / 0:00 and the
    // scrubber had a max of 0 on every reload.
    if (video.readyState >= HAVE_METADATA) onMeta();
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, [scrubbing]);

  const progress = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div
      // group/dv: the chrome is revealed by hovering the surface. tabIndex makes
      // the surface itself focusable so the keyboard shortcuts have an owner.
      className={`group/dv relative aspect-video w-full overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-foreground/10 [[data-theme=dark]_&]:ring-white/15 ${className}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        // Contained, not cropped: a walkthrough is a screen recording, and
        // losing an edge of the app being demoed is worse than a letterbox.
        className="h-full w-full object-contain"
      />

      {/* Big centre play target while paused — the whole reason someone opened
          this page. It fades out during playback so it never sits over the app
          being demoed. */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={!ready}
        aria-label="Play video"
        // pb on phones only: a 16:9 frame at that width is short enough that the
        // control bar takes a third of it, and a centred play button sat on the
        // scrubber. Above sm there is room to centre on the whole frame.
        className={`absolute inset-0 flex flex-col items-center justify-center gap-3 pb-16 transition-opacity duration-300 sm:pb-0 ${
          playing
            ? "pointer-events-none opacity-0"
            : "opacity-100 disabled:cursor-default"
        }`}
      >
        {/* Smaller on phones, where the frame it sits in is a third the height
            it is on a desktop and a 64px disc covered the presenter. */}
        <span className="flex size-12 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md transition-[transform,background-color] duration-200 group-hover/dv:bg-white/25 group-hover/dv:scale-[1.04] sm:size-16">
          <IconPlay className="size-5 translate-x-[1px] sm:size-6" />
        </span>
        {/* Stacked with the play glyph rather than absolutely placed, so the
            pair stays centred as the frame changes height. Dropped on phones,
            where a 16:9 frame is short enough that the line would land on the
            control bar. */}
        {!ready && (
          <span className="hidden text-sm text-white/45 sm:inline">
            Demo video coming soon
          </span>
        )}
      </button>

      {/* Control bar. Always up while paused (so the page reads as a player at
          rest), revealed on hover or keyboard focus once it's running. */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-6 transition-opacity duration-200 sm:pt-10 ${
          playing
            ? "opacity-0 group-hover/dv:opacity-100 group-focus-within/dv:opacity-100"
            : "opacity-100"
        }`}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={time}
          disabled={!ready}
          aria-label="Seek"
          onPointerDown={() => setScrubbing(true)}
          onPointerUp={() => setScrubbing(false)}
          onChange={(e) => seek(Number(e.target.value))}
          // The filled part is painted with a gradient stop at the playhead:
          // one element, so the thumb can never drift from the fill.
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,0.9) ${progress}%, rgba(255,255,255,0.22) ${progress}%)`,
          }}
          className="dv-range h-1 w-full cursor-pointer appearance-none rounded-full disabled:cursor-default"
        />

        <div className="mt-2.5 flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!ready}
            aria-label={playing ? "Pause" : "Play"}
            className="flex size-8 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/15 disabled:cursor-default disabled:text-white/35 disabled:hover:bg-transparent"
          >
            {playing ? (
              <IconPause className="size-4" />
            ) : (
              <IconPlay className="size-4 translate-x-[1px]" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            disabled={!ready}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex size-8 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/15 disabled:cursor-default disabled:text-white/35 disabled:hover:bg-transparent"
          >
            {muted ? (
              <IconMuted className="size-4" />
            ) : (
              <IconSound className="size-4" />
            )}
          </button>

          {/* Tabular figures so the digits don't shuffle the row every second. */}
          <span className="text-xs tabular-nums text-white/70">
            {formatTime(time)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={enterFullscreen}
            disabled={!ready}
            aria-label="Full screen"
            className="ml-auto flex size-8 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/15 disabled:cursor-default disabled:text-white/35 disabled:hover:bg-transparent"
          >
            <IconFullscreen className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** m:ss, and h:mm:ss once there's an hour to show. */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const total = Math.floor(seconds);
  const s = String(total % 60).padStart(2, "0");
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

// HTMLMediaElement.HAVE_METADATA — duration and dimensions are known.
const HAVE_METADATA = 1;

type IconProps = { className?: string };

function IconPlay({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5.5v13a.75.75 0 0 0 1.14.64l10.5-6.5a.75.75 0 0 0 0-1.28l-10.5-6.5A.75.75 0 0 0 8 5.5Z" />
    </svg>
  );
}

function IconPause({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7 5h3.2v14H7zM13.8 5H17v14h-3.2z" />
    </svg>
  );
}

function IconSound({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 9.5h3L12 5.5v13L7 14.5H4z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M18.8 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  );
}

function IconMuted({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 9.5h3L12 5.5v13L7 14.5H4z" />
      <path d="m16 9.5 4.5 5M20.5 9.5 16 14.5" />
    </svg>
  );
}

function IconFullscreen({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
    </svg>
  );
}
