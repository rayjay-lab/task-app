import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          task-app
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          A Next.js app with Supabase auth.
        </p>
        <div className="flex gap-4 text-base font-medium">
          <Link
            className="flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="/signup"
          >
            Sign up
          </Link>
          <Link
            className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            href="/login"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
