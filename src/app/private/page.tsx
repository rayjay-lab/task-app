import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function PrivatePage() {
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

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          {org?.name}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as <span className="font-medium">{userData.user.email}</span>
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Role: <span className="font-medium capitalize">{profile.role}</span>
        </p>
        {profile.role === "manager" && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Invite code: <span className="font-mono font-medium">{org?.invite_code}</span>
          </p>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-black/[.08] px-5 py-2 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
