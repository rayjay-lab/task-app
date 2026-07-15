"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { updateTaskStatus, updateTask, deleteTask } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Person = { email: string };
type Member = { id: string; email: string };

export type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "open" | "done";
  assigned_to: string | null;
  assigned_by: string | null;
  assignee: Person | Person[] | null;
  assigner: Person | Person[] | null;
};

function oneOf<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default function TaskRow({
  task,
  currentUserId,
  isManager,
  members,
}: {
  task: Task;
  currentUserId: string;
  isManager: boolean;
  members: Member[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const assignee = oneOf(task.assignee);
  const assigner = oneOf(task.assigner);
  const canToggle = isManager || task.assigned_to === currentUserId;
  const nextStatus = task.status === "open" ? "done" : "open";
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = task.status === "open" && !!task.due_date && task.due_date < today;

  function toggleStatus() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("task_id", task.id);
      fd.set("status", nextStatus);
      await updateTaskStatus(fd);
      toast.success(nextStatus === "done" ? "Task marked done" : "Task reopened");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("task_id", task.id);
      await deleteTask(fd);
      toast.success("Task deleted");
    });
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent>
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateTask(formData);
                toast.success("Task updated");
                setIsEditing(false);
              });
            }}
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="task_id" value={task.id} />
            <div className="flex flex-col gap-2">
              <Label htmlFor={`title-${task.id}`}>Title</Label>
              <Input id={`title-${task.id}`} name="title" defaultValue={task.title} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`description-${task.id}`}>Description</Label>
              <Textarea
                id={`description-${task.id}`}
                name="description"
                defaultValue={task.description ?? ""}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`assigned_to-${task.id}`}>Assign to</Label>
                <Select name="assigned_to" defaultValue={task.assigned_to ?? undefined} required>
                  <SelectTrigger id={`assigned_to-${task.id}`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`due_date-${task.id}`}>Due date</Label>
                <Input
                  id={`due_date-${task.id}`}
                  name="due_date"
                  type="date"
                  defaultValue={task.due_date ?? ""}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                Save
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium">{task.title}</p>
            {task.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{task.description}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-1.5">
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            <Badge variant={task.status === "done" ? "secondary" : "outline"}>{task.status}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>To: {assignee?.email ?? "—"}</span>
          <span>By: {assigner?.email ?? "—"}</span>
          {task.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {task.due_date}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {canToggle && (
            <Button size="sm" variant="outline" disabled={isPending} onClick={toggleStatus}>
              Mark as {nextStatus}
            </Button>
          )}
          {isManager && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                    <AlertDialogDescription>
                      &ldquo;{task.title}&rdquo; will be permanently deleted. This can&apos;t be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
