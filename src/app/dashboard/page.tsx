import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ListTodo, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { NavBar } from "@/components/nav-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organizations(name, invite_code)")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const org = Array.isArray(profile.organizations)
    ? profile.organizations[0]
    : profile.organizations;

  const [{ count: myOpenCount }, { count: orgOpenCount }, { count: memberCount }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "open")
        .eq("assigned_to", userData.user.id),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar orgName={org?.name ?? ""} email={userData.user.email ?? ""} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{org?.name}</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {userData.user.email} ·{" "}
            <span className="capitalize">{profile.role}</span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/tasks?view=mine&status=open">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>My open tasks</CardDescription>
                <ListTodo className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{myOpenCount ?? 0}</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tasks?view=all&status=open">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>Org open tasks</CardDescription>
                <CheckCircle2 className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{orgOpenCount ?? 0}</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/members">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>Team members</CardDescription>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{memberCount ?? 0}</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {profile.role === "manager" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Invite teammates</CardTitle>
              <CardDescription>Share this code so others can join {org?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="font-mono text-sm">
                {org?.invite_code}
              </Badge>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
