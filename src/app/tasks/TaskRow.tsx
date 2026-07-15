import { updateTaskStatus } from "@/app/actions/tasks";

type Person = { email: string };

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

export default function TaskRow({
  task,
  currentUserId,
  isManager,
}: {
  task: Task;
  currentUserId: string;
  isManager: boolean;
}) {
  const assignee = oneOf(task.assignee);
  const assigner = oneOf(task.assigner);
  const canToggle = isManager || task.assigned_to === currentUserId;
  const nextStatus = task.status === "open" ? "done" : "open";

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-black dark:text-zinc-50">{task.title}</p>
          {task.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            task.status === "done"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          }`}
        >
          {task.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 text-xs text-zinc-600 dark:text-zinc-400">
        <span>Assigned to: {assignee?.email ?? "—"}</span>
        <span>Assigned by: {assigner?.email ?? "—"}</span>
        {task.due_date && <span>Due: {task.due_date}</span>}
      </div>

      {canToggle && (
        <form action={updateTaskStatus}>
          <input type="hidden" name="task_id" value={task.id} />
          <input type="hidden" name="status" value={nextStatus} />
          <button
            type="submit"
            className="self-start rounded-full border border-black/[.08] px-4 py-1 text-sm transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Mark as {nextStatus}
          </button>
        </form>
      )}
    </div>
  );
}
