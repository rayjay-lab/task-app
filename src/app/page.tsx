"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="size-5 text-brand" />
          task-app
        </span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex max-w-md flex-col items-center gap-4"
        >
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Sticky notes, without the sticky notes.
          </h1>
          <p className="text-muted-foreground text-balance">
            Assign tasks to your team, track what&apos;s done, and keep everyone on the same
            page &mdash; all in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="flex gap-3"
        >
          <Button render={<Link href="/signup">Sign up</Link>} size="lg" nativeButton={false} />
          <Button
            render={<Link href="/login">Log in</Link>}
            size="lg"
            variant="outline"
            nativeButton={false}
          />
        </motion.div>
      </main>
    </div>
  );
}
