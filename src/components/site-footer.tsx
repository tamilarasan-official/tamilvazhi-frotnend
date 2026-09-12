export function SiteFooter({ siteName }: { siteName: string }) {
  return (
    <footer className="border-t border-ink-700 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-[12px] text-ink-500 sm:px-6">
        <span>
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </span>
        <span className="uppercase tracking-[0.12em]">Course Content Portal</span>
      </div>
    </footer>
  );
}
