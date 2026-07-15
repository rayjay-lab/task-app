"use client";

import { AnimatePresence, motion } from "motion/react";
import { ClipboardList } from "lucide-react";
import TaskRow, { type Task } from "./TaskRow";

type Member = { id: string; email: string };

export default function TaskList({
  tasks,
  currentUserId,
  isManager,
  members,
}: {
  tasks: Task[];
  currentUserId: string;
  isManager: boolean;
  members: Member[];
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <ClipboardList className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false} mode="popLayout">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <TaskRow
              task={task}
              currentUserId={currentUserId}
              isManager={isManager}
              members={members}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
