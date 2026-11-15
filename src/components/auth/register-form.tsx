"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

function passwordScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["#fb7185", "#fb7185", "#fbbf24", "#38bdf8", "#2dd4a7"];

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const score = useMemo(() => passwordScore(password), [password]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setConfirmationNotice(null);
    setFieldErrors({});

    if (password.length < 8) {
      setFieldErrors({ password: "Password must be at least 8 characters" });
      toast({
        title: "Password too short",
        description: "Use at least 8 characters to keep your account secure.",
        variant: "error",
      });
      return;
    }
    if (password !== confirm) {
      setFieldErrors({ confirm: "Passwords do not match" });
      toast({
        title: "Passwords do not match",
        description: "Re-enter the same password in both fields.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data.error ?? "Unable to create your account. Please try again.";
        setError(message);
        setFieldErrors(data.fieldErrors ?? {});
        toast({ title: "Could not create account", description: message, variant: "error" });
        return;
      }

      if (data.confirmationRequired) {
        setConfirmationNotice(`We sent a confirmation link to ${email.trim()}. Open it to activate your account.`);
        toast({
          title: "Check your inbox",
          description: "Confirm your email to finish creating your account.",
        });
        return;
      }

      toast({ title: "Account created", description: "Welcome to Mcpatenz Bill Tracker." });
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint-soft">
          Get started free
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Three minutes now, and every due date is handled from here on.
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

      {confirmationNotice ? (
        <div
          role="status"
          className="mt-5 rounded-xl border border-mint/30 bg-mint/10 px-3.5 py-3 text-xs font-medium leading-relaxed text-mint-soft"
        >
          {confirmationNotice}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          name="name"
          label="Full name"
          autoComplete="name"
          placeholder=""
          value={name}
          onChange={(event) => setName(event.target.value)}
          icon={<User className="size-4" />}
          error={fieldErrors.name}
          required
        />
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
          hint="Reminders arrive here"
          required
        />
        <div>
          <Input
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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
          {password ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className="h-1 flex-1 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor:
                        index < score ? strengthColors[score] : "rgba(148,163,184,0.16)",
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-medium" style={{ color: strengthColors[score] }}>
                {strengthLabels[score]}
              </span>
            </div>
          ) : null}
        </div>
        <Input
          name="confirm"
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder=""
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          icon={<Lock className="size-4" />}
          error={fieldErrors.confirm}
          required
        />

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create free account
          <ArrowRight className="size-4" />
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          By creating an account you agree to receive due-date reminder emails. You can change or
          disable them anytime in settings.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-violet-soft transition hover:text-white">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
