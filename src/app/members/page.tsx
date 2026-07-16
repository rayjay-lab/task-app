import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MemberList from "./MemberList";

export default async function MembersPage() {
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

  const { data: members } = await supabase
    .from("profiles")
    .select("id, email, role")
    .order("created_at", { ascending: true });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar orgName={org?.name ?? ""} email={userData.user.email ?? ""} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">{org?.name} members</h1>

        {profile.role === "manager" && (
          <Card className="mb-6">
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

        <MemberList
          members={members ?? []}
          currentUserId={userData.user.id}
          isManager={profile.role === "manager"}
        />
      </main>
    </div>
  );
}
