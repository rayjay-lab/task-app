"use client";

import { motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Member = { id: string; email: string; role: string };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function MemberList({ members }: { members: Member[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-2"
    >
      {members.map((m) => (
        <motion.div key={m.id} variants={item}>
          <Card>
            <CardContent className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-brand text-xs text-brand-foreground">
                    {m.email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{m.email}</span>
              </div>
              <Badge variant={m.role === "manager" ? "default" : "secondary"} className="capitalize">
                {m.role}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
