"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type TaskActionState = { error: string } | undefined;

export async function createTask(
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { error: "Not signed in" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile) {
    return { error: "No organization" };
  }

  const dueDate = formData.get("due_date") as string;

  const { error } = await supabase.from("tasks").insert({
    organization_id: profile.organization_id,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    assigned_to: formData.get("assigned_to") as string,
    assigned_by: userData.user.id,
    due_date: dueDate || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  const supabase = await createClient();

  await supabase
    .from("tasks")
    .update({ status: formData.get("status") as string })
    .eq("id", formData.get("task_id") as string);

  revalidatePath("/tasks");
}
