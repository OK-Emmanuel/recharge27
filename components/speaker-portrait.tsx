import Image from "next/image"
import { initials, type Speaker } from "@/lib/speakers"

// Shows the speaker's photo when one is provided, otherwise an editorial monogram placeholder.
export function SpeakerPortrait({ speaker, className = "", sizes }: { speaker: Speaker; className?: string; sizes: string }) {
  return (
    <div className={`portrait ${className}`}>
      {speaker.photo ? (
        <Image src={speaker.photo} alt={speaker.placeholder ? "" : `Portrait of ${speaker.name}`} fill sizes={sizes} className="object-cover" />
      ) : (
        <span
          aria-hidden
          className="portrait-numeral absolute inset-0 flex items-center justify-center font-serif text-[7rem] leading-none font-light text-gold-deep/70 sm:text-[8rem]"
        >
          {initials(speaker)}
        </span>
      )}
    </div>
  )
}
