import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import CreateTaskForm from "./CreateTaskForm";
import TaskRow, { type Task } from "./TaskRow";

type SearchParams = { view?: string; status?: string };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const isManager = profile.role === "manager";
  const params = await searchParams;
  const view =
    params.view === "all" || params.view === "mine" ? params.view : isManager ? "all" : "mine";
  const statusFilter =
    params.status === "open" || params.status === "done" ? params.status : "all";

  let query = supabase
    .from("tasks")
    .select(
      "id, title, description, due_date, status, assigned_to, assigned_by, assignee:profiles!tasks_assigned_to_fkey(email), assigner:profiles!tasks_assigned_by_fkey(email)",
    )
    .order("status", { ascending: false })
    .order("due_date", { ascending: true, nullsFirst: false });

  if (view === "mine") {
    query = query.eq("assigned_to", userData.user.id);
  }
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: tasks } = await query;

  const { data: members } = isManager
    ? await supabase.from("profiles").select("id, email").order("email")
    : { data: null };

  const filterLink = (v: string, s: string) => `/tasks?view=${v}&status=${s}`;
  const activeClass = "bg-foreground text-background";
  const inactiveClass = "border border-black/[.08] dark:border-white/[.145]";

  return (
    <div className="flex flex-1 flex-col items-center gap-8 bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Tasks</h1>
        <div className="flex gap-4 text-sm font-medium text-black dark:text-zinc-50">
          <Link href="/members">Members</Link>
          <Link href="/private">Back</Link>
        </div>
      </div>

      {isManager && members && <CreateTaskForm members={members} />}

      <div className="flex w-full max-w-2xl flex-wrap items-center gap-2 text-sm">
        <Link href={filterLink("mine", statusFilter)} className={`rounded-full px-4 py-1 ${view === "mine" ? activeClass : inactiveClass}`}>
          My tasks
        </Link>
        <Link href={filterLink("all", statusFilter)} className={`rounded-full px-4 py-1 ${view === "all" ? activeClass : inactiveClass}`}>
          All tasks
        </Link>
        <span className="mx-1 text-zinc-400">|</span>
        <Link href={filterLink(view, "all")} className={`rounded-full px-4 py-1 ${statusFilter === "all" ? activeClass : inactiveClass}`}>
          All
        </Link>
        <Link href={filterLink(view, "open")} className={`rounded-full px-4 py-1 ${statusFilter === "open" ? activeClass : inactiveClass}`}>
          Open
        </Link>
        <Link href={filterLink(view, "done")} className={`rounded-full px-4 py-1 ${statusFilter === "done" ? activeClass : inactiveClass}`}>
          Done
        </Link>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-3">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task as Task}
              currentUserId={userData.user.id}
              isManager={isManager}
              members={members ?? []}
            />
          ))
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No tasks found.</p>
        )}
      </div>
    </div>
  );
}
