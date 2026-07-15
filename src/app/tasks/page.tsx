import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import CreateTaskForm from "./CreateTaskForm";
import TaskList from "./TaskList";
import type { Task } from "./TaskRow";

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
    .select("role, organizations(name)")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const org = Array.isArray(profile.organizations) ? profile.organizations[0] : profile.organizations;
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar orgName={org?.name ?? ""} email={userData.user.email ?? ""} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Tasks</h1>

        {isManager && members && <CreateTaskForm members={members} />}

        <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              render={<Link href={filterLink("mine", statusFilter)}>My tasks</Link>}
              size="sm"
              nativeButton={false}
              variant={view === "mine" ? "default" : "outline"}
            />
            <Button
              render={<Link href={filterLink("all", statusFilter)}>All tasks</Link>}
              size="sm"
              nativeButton={false}
              variant={view === "all" ? "default" : "outline"}
            />
          </div>
          <div className="flex gap-2">
            <Button
              render={<Link href={filterLink(view, "all")}>All</Link>}
              size="sm"
              nativeButton={false}
              variant={statusFilter === "all" ? "secondary" : "ghost"}
            />
            <Button
              render={<Link href={filterLink(view, "open")}>Open</Link>}
              size="sm"
              nativeButton={false}
              variant={statusFilter === "open" ? "secondary" : "ghost"}
            />
            <Button
              render={<Link href={filterLink(view, "done")}>Done</Link>}
              size="sm"
              nativeButton={false}
              variant={statusFilter === "done" ? "secondary" : "ghost"}
            />
          </div>
        </div>

        <TaskList
          tasks={(tasks ?? []) as Task[]}
          currentUserId={userData.user.id}
          isManager={isManager}
          members={members ?? []}
        />
      </main>
    </div>
  );
}
