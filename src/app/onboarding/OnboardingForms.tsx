"use client";

import { useActionState } from "react";
import { createOrganization, joinOrganization } from "@/app/actions/organizations";

export default function OnboardingForms() {
  const [createState, createAction, createPending] = useActionState(
    createOrganization,
    undefined,
  );
  const [joinState, joinAction, joinPending] = useActionState(
    joinOrganization,
    undefined,
  );

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <form
          action={createAction}
          className="flex flex-col gap-4 rounded-lg border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950"
        >
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Create an organization
          </h2>
          <input
            name="name"
            placeholder="Organization name"
            required
            className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
          />
          {createState?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{createState.error}</p>
          )}
          <button
            type="submit"
            disabled={createPending}
            className="rounded-full bg-foreground px-5 py-2 text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {createPending ? "Creating..." : "Create"}
          </button>
        </form>

        <form
          action={joinAction}
          className="flex flex-col gap-4 rounded-lg border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950"
        >
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Join an organization
          </h2>
          <input
            name="code"
            placeholder="Invite code"
            required
            className="rounded border border-black/[.08] px-3 py-2 uppercase dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
          />
          {joinState?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{joinState.error}</p>
          )}
          <button
            type="submit"
            disabled={joinPending}
            className="rounded-full border border-black/[.08] px-5 py-2 transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            {joinPending ? "Joining..." : "Join"}
          </button>
        </form>
      </div>
    </div>
  );
}
