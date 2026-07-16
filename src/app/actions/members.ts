"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type MemberActionState = { error: string } | undefined;

export async function removeMember(formData: FormData): Promise<MemberActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("remove_member", {
    target_id: formData.get("member_id") as string,
  });

  revalidatePath("/members");
  revalidatePath("/tasks");

  if (error) {
    return { error: error.message };
  }
}

export async function updateMemberRole(formData: FormData): Promise<MemberActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("update_member_role", {
    target_id: formData.get("member_id") as string,
    new_role: formData.get("new_role") as string,
  });

  revalidatePath("/members");

  if (error) {
    return { error: error.message };
  }
}
