import type { Metadata } from "next";
import { DemoVideoPlayer } from "@/components/demo-video/demo-video-player";
import { DEMO_URL, SIGNUP_URL } from "@/lib/constants";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.demoVideo);

// The launch walkthrough. Transcoded to 1080p at ~1.2 Mbps (the source was a
// 20 Mbps master, far too heavy to ship), with the poster pulled from it.
const DEMO_VIDEO_SRC = "/videos/assembly-demo.mp4";
const DEMO_VIDEO_POSTER = "/videos/assembly-demo-poster.jpg";

// The centered lede the Brand, Templates and Copilot-rebrand pages share.
const PRIMARY_BUTTON =
  "rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90";
const SECONDARY_BUTTON =
  "rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5";

export default function DemoVideoPage() {
  return (
    <section className="px-6 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-[1600px]">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="type-display text-balance">
            See how Assembly can work for your business
          </h1>
          <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
            Watch a walkthrough of Assembly, from building an app by chat to the
            branded client portal your clients log in to.
          </p>
          <div className="mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:mx-auto sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
            <a href={SIGNUP_URL} className={PRIMARY_BUTTON}>
              Get started
            </a>
            <a href={DEMO_URL} className={SECONDARY_BUTTON}>
              Book a demo
            </a>
          </div>
        </div>

        {/* Capped short of the page rail: at 1600px a full-width 16:9 frame is
            taller than the viewport, and the video is the thing to keep in one
            piece. */}
        <div className="mx-auto mt-14 max-w-5xl md:mt-20">
          <DemoVideoPlayer
            src={DEMO_VIDEO_SRC || undefined}
            poster={DEMO_VIDEO_POSTER || undefined}
          />
        </div>
      </div>
    </section>
  );
}
