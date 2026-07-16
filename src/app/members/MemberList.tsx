"use client";

import { useTransition } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { removeMember, updateMemberRole } from "@/app/actions/members";

type Member = { id: string; email: string; role: string };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function MemberList({
  members,
  currentUserId,
  isManager,
}: {
  members: Member[];
  currentUserId: string;
  isManager: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function toggleRole(member: Member) {
    const newRole = member.role === "manager" ? "member" : "manager";
    startTransition(async () => {
      const fd = new FormData();
      fd.set("member_id", member.id);
      fd.set("new_role", newRole);
      const result = await updateMemberRole(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(newRole === "manager" ? "Promoted to manager" : "Demoted to member");
      }
    });
  }

  function handleRemove(member: Member) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("member_id", member.id);
      const result = await removeMember(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Member removed");
      }
    });
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-2"
    >
      {members.map((m) => {
        const isSelf = m.id === currentUserId;
        return (
          <motion.div key={m.id} variants={item}>
            <Card>
              <CardContent className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-brand text-xs text-brand-foreground">
                      {m.email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {m.email}
                    {isSelf && <span className="text-muted-foreground"> (you)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.role === "manager" ? "default" : "secondary"} className="capitalize">
                    {m.role}
                  </Badge>
                  {isManager && !isSelf && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        disabled={isPending}
                        onClick={() => toggleRole(m)}
                      >
                        {m.role === "manager" ? (
                          <ShieldOff className="size-4" />
                        ) : (
                          <ShieldCheck className="size-4" />
                        )}
                        <span className="sr-only">
                          {m.role === "manager" ? "Demote" : "Promote"}
                        </span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:text-destructive"
                            >
                              <UserMinus className="size-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {m.email}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              They&apos;ll lose access to this organization immediately. Their
                              past task assignments are kept but unassigned.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemove(m)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
