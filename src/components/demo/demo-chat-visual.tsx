import Image from "next/image";

/**
 * The chat mock beside the demo form. Drawn once at its Figma size and scaled
 * to whatever box the page gives it — the same approach the template covers use
 * (`.template-mock-fit`), because reflowing a composition this tuned only
 * cramps it. Fitting on both axes means an off-ratio column letterboxes into
 * the card's own blue rather than distorting or cropping.
 */

// Design size of the glass panel (the artwork inside the blue card). The panel
// hugs its own content, so PANEL_H is only what the fit maths measures against:
// it's the stack's height once the messages are set in real (untrimmed) type,
// which runs taller than the 757 in Figma.
const PANEL_W = 675;
const PANEL_H = 822;
// Breathing room between the two messages and the composer.
const STACK_GAP = 42;
// How much of the card the panel fills — matches the margin it has in the
// Figma frame (675 of an 860-wide card).
const PANEL_FILL = 0.785;

const FIT = `translate(-50%, -50%) scale(calc(min(tan(atan2(100cqw, ${PANEL_W}px)), tan(atan2(100cqh, ${PANEL_H}px))) * ${PANEL_FILL}))`;

function MessageHeader({ name, dark }: { name: string; dark?: boolean }) {
  return (
    <div className={`flex w-full gap-[17px] whitespace-nowrap text-[20.4px] ${dark ? "text-white" : "text-black"}`}>
      <span className="opacity-50">{name}</span>
      <span className="opacity-30">1:34 PM</span>
    </div>
  );
}

export function DemoChatVisual({ className = "" }: { className?: string }) {
  return (
    <div
      // aria-hidden: decorative. The page's copy already says what it shows.
      aria-hidden
      className={`relative overflow-hidden rounded-2xl bg-[#7da4ff] [container-type:size] ${className}`}
    >
      <div
        style={{ width: PANEL_W, gap: STACK_GAP, transform: FIT }}
        className="absolute left-1/2 top-1/2 flex flex-col items-end rounded-[40px] border border-white bg-white/40 px-[31px] py-[34.5px] backdrop-blur-[15.7px]"
      >
        {/* Client message — square corner on the side the avatar sits. */}
        <div className="flex w-full items-start gap-[11px]">
          {/* Height hugs the copy rather than being pinned to the Figma value:
              the design's text-box trim isn't safe to rely on across browsers,
              and untrimmed the second line spilled past the fill. */}
          <div className="flex w-[526.5px] shrink-0 flex-col rounded-[34px] rounded-br-none bg-black px-[34px] py-[28px]">
            <div className="flex w-[353px] flex-col gap-[25.5px] text-white">
              <MessageHeader name="Robin" dark />
              <p className="text-[20px] leading-normal tracking-[-0.6px]">
                Build a project tracker for our client implementation process.
              </p>
            </div>
          </div>
          <div className="relative size-[68px] shrink-0 overflow-hidden rounded-full">
            {/* Framing comes from the Figma crop, so the face lands in the circle. */}
            <Image
              src="/images/demo-chat-avatar.png"
              alt=""
              width={410}
              height={512}
              className="absolute left-[-40.07%] top-[-35.48%] h-[204.02%] w-[163.23%] max-w-none"
            />
          </div>
        </div>

        {/* Assembly reply — mark on the left, square corner facing it. */}
        <div className="flex w-full items-end justify-between">
          <div className="relative size-[67px] shrink-0 rounded-[10px] bg-[#d9ed92]">
            <Image
              src="/images/logo-mark.svg"
              alt=""
              width={35}
              height={35}
              className="absolute left-[21.06%] top-[21.57%] h-[34.9px] w-[35px]"
            />
          </div>
          {/* Laid out in flow rather than at the design's absolute offsets: the
              gap under "Got it!" is a margin, so it holds at the real line box
              instead of closing up the way trimmed Figma text implies. */}
          <div className="relative flex w-[527px] shrink-0 flex-col rounded-[34px] rounded-bl-none bg-white px-[34px] pb-[45px] pt-[30px]">
            <div className="flex w-[353px] flex-col gap-[25.5px] text-[20.4px] text-black">
              <MessageHeader name="Assembly" />
              <p className="leading-normal">Got it! I&rsquo;ll outline the plan:</p>
            </div>

            {/* Height comes from the text rather than the design's measured
                222px: the card was sized to one exact block of copy, so editing
                a line left a band of empty white under it. */}
            <div className="relative mt-[28px] w-[452px]">
              {/* The plan card floats on its own glow rather than a shadow: the
                  blue-to-lime wash is what marks it as the generated artifact.
                  Sized off the card it sits behind, so it keeps the few pixels
                  of spill the design has on every edge however tall it gets. */}
              <div
                className="absolute -inset-x-[0.5px] -inset-y-[3px] blur-[10.7px]"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgb(190, 216, 255) 0%, rgb(217, 237, 146) 80%)",
                }}
              />
              <div className="relative rounded-[34px] bg-white px-[34px] py-[36px]">
                <p className="text-[20.4px] leading-[1.211] text-black opacity-80">
                  1. Track phases, milestones, and due dates
                  <br />
                  <br />
                  2. Share one client view so everyone stays aligned
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[85.5px] w-[608px] items-center justify-between rounded-full bg-white/50 py-[15.76px] pl-[29.5px] pr-[15.76px] backdrop-blur-[36px]">
          <span className="text-[26.3px] tracking-[-0.79px] text-black opacity-60">
            How can I help?
          </span>
          <svg
            width="54"
            height="54"
            viewBox="0 0 53.9604 53.9604"
            fill="none"
            className="shrink-0"
            aria-hidden
          >
            <rect width="53.9604" height="53.9604" rx="26.9802" fill="white" />
            <path
              d="M15.7627 26.9802L35.9979 26.9802M27.4102 37.0977L35.9979 26.9802L27.4102 16.8626"
              stroke="black"
              strokeWidth="2.24835"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
