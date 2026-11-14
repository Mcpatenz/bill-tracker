"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data.error ?? "Unable to sign in. Please try again.";
        setError(message);
        setFieldErrors(data.fieldErrors ?? {});
        toast({ title: "Sign in failed", description: message, variant: "error" });
        return;
      }

      toast({ title: "Welcome back", description: "You are signed in." });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — check your connection and try again.");
      toast({
        title: "Network error",
        description: "Check your connection and try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-soft">
          Welcome back
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
          Sign in to Mcpatenz Bill Tracker
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          See what is due next and keep every reminder on schedule.
        </p>
      </div>

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              role="alert"
              className="mt-5 rounded-xl border border-rose/30 bg-rose/10 px-3.5 py-2.5 text-xs font-medium text-rose"
            >
              {error}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder=""
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<Mail className="size-4" />}
          error={fieldErrors.email}
          required
        />
        <Input
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder=""
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          icon={<Lock className="size-4" />}
          error={fieldErrors.password}
          required
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        New to Mcpatenz Bill Tracker?{" "}
        <Link href="/register" className="font-semibold text-violet-soft transition hover:text-white">
          Create a free account
        </Link>
      </p>
    </motion.div>
  );
}
