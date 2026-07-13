import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OnboardingForms from "./OnboardingForms";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile) {
    redirect("/private");
  }

  return <OnboardingForms />;
}
