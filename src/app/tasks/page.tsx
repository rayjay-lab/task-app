import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import CreateTaskForm from "./CreateTaskForm";
import TaskRow, { type Task } from "./TaskRow";

export default async function TasksPage() {
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

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "id, title, description, due_date, status, assigned_to, assigned_by, assignee:profiles!tasks_assigned_to_fkey(email), assigner:profiles!tasks_assigned_by_fkey(email)",
    )
    .order("created_at", { ascending: false });

  const { data: members } = isManager
    ? await supabase.from("profiles").select("id, email").order("email")
    : { data: null };

  return (
    <div className="flex flex-1 flex-col items-center gap-8 bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Tasks</h1>
        <Link href="/private" className="text-sm font-medium text-black dark:text-zinc-50">
          Back
        </Link>
      </div>

      {isManager && members && <CreateTaskForm members={members} />}

      <div className="flex w-full max-w-2xl flex-col gap-3">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task as Task}
              currentUserId={userData.user.id}
              isManager={isManager}
            />
          ))
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No tasks yet.</p>
        )}
      </div>
    </div>
  );
}
