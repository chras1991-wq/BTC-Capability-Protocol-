import Link from "next/link";
import { RootMark } from "@/components/RootMark";

export function DocShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-full max-w-3xl px-5 py-16 md:px-8">
      <div className="mb-10 flex items-center justify-between gap-4">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] hover:text-[var(--copper)]"
        >
          <RootMark className="h-4 w-4" />
          Docs
        </Link>
        <Link href="/" className="text-sm text-[var(--ink-soft)]/70 hover:text-[var(--ink)]">
          Home
        </Link>
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-700 md:text-4xl">
        {title}
      </h1>
      <article className="prose-root mt-10 space-y-6 text-[var(--ink-soft)] leading-relaxed [&_h2]:mt-12 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-2xl [&_h2]:font-600 [&_h2]:text-[var(--ink)] [&_h3]:mt-8 [&_h3]:font-[family-name:var(--font-display)] [&_h3]:text-xl [&_h3]:font-600 [&_h3]:text-[var(--ink)] [&_code]:rounded-sm [&_code]:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-[family-name:var(--font-mono)] [&_code]:text-[0.9em] [&_code]:text-[var(--copper-deep)] [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-[var(--line)] [&_pre]:bg-[#12151a] [&_pre]:p-4 [&_pre]:font-[family-name:var(--font-mono)] [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:text-[var(--mist)] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:text-[var(--ink)] [&_a]:text-[var(--copper-deep)] [&_a]:underline-offset-2 hover:[&_a]:underline">
        {children}
      </article>
    </main>
  );
}
