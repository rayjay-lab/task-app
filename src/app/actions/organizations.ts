"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type OrgActionState = { error: string } | undefined;

export async function createOrganization(
  _prevState: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("create_organization", {
    org_name: formData.get("name") as string,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function joinOrganization(
  _prevState: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("join_organization", {
    code: formData.get("code") as string,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
