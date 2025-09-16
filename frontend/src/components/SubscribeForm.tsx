"use client";

import { useActionState, useEffect, useRef, useState } from "react";

type SubscribeAction = (prev: { ok: boolean }, formData: FormData) => Promise<{ ok: boolean }>;

export default function SubscribeForm({ action }: { action: SubscribeAction }) {
  const initialState = { ok: false } as { ok: boolean };
  const [state, formAction] = useActionState(action, initialState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      setOpen(true);
      formRef.current?.reset();
    }
  }, [state?.ok]);

  return (
    <>
      <form ref={formRef} action={formAction} className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-2">
        <input
          type="email"
          placeholder="stayupdated@gmail.com"
          name="email"
          required
          autoComplete="off"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none sm:flex-1"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-black hover:bg-[var(--color-primary-300)]"
        >
          Notify when launch
        </button>
      </form>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* background overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* modal content */}
          <div className="relative z-10 w-[90%] max-w-sm rounded-2xl border border-white/10 
                          bg-[var(--color-primary)]/90 backdrop-blur-md p-6 text-left shadow-xl">
            <h3 className="text-lg font-semibold text-white">You&apos;re on the list 🎉</h3>
            <p className="mt-2 text-sm text-white/80">
              Appreciate you joining, and we&apos;ll email you when we launch.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm 
                          hover:bg-white/20 text-white"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

