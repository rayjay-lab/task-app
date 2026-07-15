"use client";

import { useActionState } from "react";
import { createTask } from "@/app/actions/tasks";

type Member = { id: string; email: string };

export default function CreateTaskForm({ members }: { members: Member[] }) {
  const [state, action, pending] = useActionState(createTask, undefined);

  return (
    <form
      action={action}
      className="flex w-full max-w-2xl flex-col gap-4 rounded-lg border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-zinc-950"
    >
      <h2 className="text-lg font-semibold text-black dark:text-zinc-50">New task</h2>

      <input
        name="title"
        placeholder="Title"
        required
        className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
      />

      <textarea
        name="description"
        placeholder="Description (optional)"
        rows={2}
        className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
      />

      <div className="flex gap-4">
        <select
          name="assigned_to"
          required
          defaultValue=""
          className="flex-1 rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
        >
          <option value="" disabled>
            Assign to...
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.email}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="due_date"
          className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-foreground px-5 py-2 text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {pending ? "Creating..." : "Create task"}
      </button>
    </form>
  );
}
