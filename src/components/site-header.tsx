import Link from "next/link";
import { LogoMark } from "./icons";

export function SiteHeader({
  siteName,
  right,
}: {
  siteName: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 border-t-[3px] border-t-brand-500 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <LogoMark className="h-8 w-8" />
          <span className="font-serif text-[19px] font-semibold tracking-tight text-ink-100">
            {siteName}
          </span>
        </Link>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
