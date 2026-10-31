import { NotifyForm } from "@/components/notify-form"
import { site } from "@/lib/site"

export function ComingSoon() {
  return (
    <div className="atmosphere relative isolate flex min-h-dvh flex-col overflow-hidden">
      <header className="rise relative z-10 flex items-center justify-between px-6 py-7 sm:px-12 sm:py-9">
        <span className="font-serif text-lg tracking-[0.32em] text-ivory uppercase sm:text-xl">
          {site.name}
        </span>
        <span className="text-[0.65rem] tracking-[0.3em] text-accent-bright uppercase sm:text-xs">Invitation only</span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10 text-center sm:px-12">
        <p className="rise text-[0.7rem] tracking-[0.42em] text-accent-bright uppercase sm:text-xs" style={{ "--delay": "150ms" } as React.CSSProperties}>
          {site.edition} &nbsp;·&nbsp; Coming Soon
        </p>

        <div className="rise hairline my-8 w-24 sm:my-10 sm:w-36" style={{ "--delay": "300ms" } as React.CSSProperties} />

        <h1
          className="rise max-w-4xl font-serif text-[2.9rem] leading-[1.04] font-light text-balance text-ivory sm:text-7xl lg:text-[5.5rem]"
          style={{ "--delay": "450ms" } as React.CSSProperties}
        >
          Fortune sides with <em className="font-normal text-accent-bright">him who dares.</em>
        </h1>

        <p
          className="rise mt-8 max-w-xl text-[0.98rem] leading-relaxed text-pretty text-mist sm:mt-10 sm:text-lg"
          style={{ "--delay": "650ms" } as React.CSSProperties}
        >
          Wealth Lab returns in {site.edition}. A private gathering for those who build with intention, and
          who value the company they keep. Details will be shared with those who are in the room.
        </p>

        <div className="rise mt-12 w-full sm:mt-14" style={{ "--delay": "850ms" } as React.CSSProperties}>
          <NotifyForm />
          <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-mist/80">
            Attendance is by approval only. Requesting an invitation does not guarantee a place.
          </p>
        </div>
      </main>

      <footer className="relative z-10 flex flex-col items-center gap-3 px-6 py-8 text-[0.68rem] tracking-[0.2em] text-mist/70 uppercase sm:flex-row sm:justify-between sm:px-12">
        <span>
          &copy; {site.edition} {site.name}
        </span>
        {site.archive2026Url && (
          <a
            href={site.archive2026Url}
            className="text-mist transition-colors duration-300 hover:text-accent-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
          >
            The 2026 Archive
          </a>
        )}
      </footer>
    </div>
  )
}
