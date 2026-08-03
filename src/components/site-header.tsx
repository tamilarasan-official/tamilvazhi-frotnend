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
    <header className="sticky top-0 z-40 border-b border-ink-700/50 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
          <LogoMark className="h-8 w-8" />
          <span className="text-[15px] font-semibold tracking-tight text-ink-100">
            {siteName}
          </span>
        </Link>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
