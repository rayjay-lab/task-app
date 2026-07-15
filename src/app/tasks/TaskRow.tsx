"use client";

import { useState } from "react";
import { updateTaskStatus, updateTask, deleteTask } from "@/app/actions/tasks";

type Person = { email: string };
type Member = { id: string; email: string };

export type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "open" | "done";
  assigned_to: string | null;
  assigned_by: string | null;
  assignee: Person | Person[] | null;
  assigner: Person | Person[] | null;
};

function oneOf<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const fieldClass =
  "rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black dark:text-zinc-50";

export default function TaskRow({
  task,
  currentUserId,
  isManager,
  members,
}: {
  task: Task;
  currentUserId: string;
  isManager: boolean;
  members: Member[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const assignee = oneOf(task.assignee);
  const assigner = oneOf(task.assigner);
  const canToggle = isManager || task.assigned_to === currentUserId;
  const nextStatus = task.status === "open" ? "done" : "open";
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = task.status === "open" && !!task.due_date && task.due_date < today;

  if (isEditing) {
    return (
      <form
        action={async (formData) => {
          await updateTask(formData);
          setIsEditing(false);
        }}
        className="flex flex-col gap-3 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950"
      >
        <input type="hidden" name="task_id" value={task.id} />
        <input name="title" defaultValue={task.title} required className={fieldClass} />
        <textarea
          name="description"
          defaultValue={task.description ?? ""}
          rows={2}
          className={fieldClass}
        />
        <div className="flex gap-4">
          <select
            name="assigned_to"
            defaultValue={task.assigned_to ?? ""}
            required
            className={`flex-1 ${fieldClass}`}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.email}
              </option>
            ))}
          </select>
          <input type="date" name="due_date" defaultValue={task.due_date ?? ""} className={fieldClass} />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-full bg-foreground px-4 py-1 text-sm text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-full border border-black/[.08] px-4 py-1 text-sm transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-black dark:text-zinc-50">{task.title}</p>
          {task.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {isOverdue && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
              Overdue
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              task.status === "done"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            }`}
          >
            {task.status}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 text-xs text-zinc-600 dark:text-zinc-400">
        <span>Assigned to: {assignee?.email ?? "—"}</span>
        <span>Assigned by: {assigner?.email ?? "—"}</span>
        {task.due_date && <span>Due: {task.due_date}</span>}
      </div>

      <div className="flex gap-2">
        {canToggle && (
          <form action={updateTaskStatus}>
            <input type="hidden" name="task_id" value={task.id} />
            <input type="hidden" name="status" value={nextStatus} />
            <button
              type="submit"
              className="rounded-full border border-black/[.08] px-4 py-1 text-sm transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Mark as {nextStatus}
            </button>
          </form>
        )}
        {isManager && (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-full border border-black/[.08] px-4 py-1 text-sm transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Edit
            </button>
            <form action={deleteTask}>
              <input type="hidden" name="task_id" value={task.id} />
              <button
                type="submit"
                className="rounded-full border border-red-200 px-4 py-1 text-sm text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              >
                Delete
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
