import { Suspense } from "react";
import CapDetailPage from "./CapDetailClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-xl px-5 py-16 text-sm text-[var(--ink-soft)]/60">
          Loading…
        </main>
      }
    >
      <CapDetailPage />
    </Suspense>
  );
}
