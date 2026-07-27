"use client";

import Image from "next/image";

const oauthButtonClass =
  "w-full h-[46px] rounded-[5px] border border-[#DFE1E4] font-sans text-base text-foreground flex items-center justify-center cursor-pointer transition-colors duration-150";

type StudioSelectEmailProps = {
  email: string;
  onContinueWithEmail: () => void;
  onUseDifferentEmail: () => void;
};

/**
 * Studio onboarding step for visitors with an active session: pick which email
 * to continue with, or switch to a different address.
 */
export function StudioSelectEmail({
  email,
  onContinueWithEmail,
  onUseDifferentEmail,
}: StudioSelectEmailProps) {
  return (
    <div className="flex w-full max-w-[446px] flex-col items-center px-5 py-10">
      <Image
        src="/images/logo-mark.svg"
        alt="Assembly Studio"
        width={40}
        height={40}
        className="mb-[18px]"
      />

      <h1 className="text-center text-[26px] leading-[1.2] font-normal text-foreground">
        Select an email to continue
      </h1>

      <div className="mt-[39px] flex w-full flex-col gap-[15px]">
        <span
          className="self-start font-mono text-[13px] tracking-[0.07em] text-foreground/53"
        >
          Continue with
        </span>

        <button
          type="button"
          onClick={onContinueWithEmail}
          className={`${oauthButtonClass} bg-[#f5f5f2] hover:bg-[#eeeeea]`}
        >
          {email}
        </button>

        <button
          type="button"
          onClick={onUseDifferentEmail}
          className={`${oauthButtonClass} bg-white hover:bg-[#f5f5f0]`}
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}
