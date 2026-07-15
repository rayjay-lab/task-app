import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

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

  const org = Array.isArray(profile.organizations) ? profile.organizations[0] : profile.organizations;

  const { data: members } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-1 flex-col items-center gap-6 bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">{org?.name} members</h1>
        <Link href="/tasks" className="text-sm font-medium text-black dark:text-zinc-50">
          Back
        </Link>
      </div>

      {profile.role === "manager" && (
        <p className="w-full max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Invite code: <span className="font-mono font-medium">{org?.invite_code}</span>
        </p>
      )}

      <div className="flex w-full max-w-2xl flex-col gap-2">
        {members?.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950"
          >
            <span className="text-black dark:text-zinc-50">{m.email}</span>
            <span className="text-sm capitalize text-zinc-600 dark:text-zinc-400">{m.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
