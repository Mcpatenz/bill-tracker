"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BellRing,
  Camera,
  Check,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CURRENCIES } from "@/lib/constants";

type SettingsUser = {
  name: string;
  email: string;
  avatar: string | null;
  notifyEmail: string | null;
  currency: string;
  leadDays: number;
};

function SectionTitle({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/25 to-mint/10 text-violet-soft shadow-[0_12px_30px_-18px_rgba(139,92,246,0.9)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-soft/80">
          {eyebrow}
        </p>
        <h2 className="mt-0.5 font-display text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export function SettingsClient({
  user,
  smtpConfigured,
}: {
  user: SettingsUser;
  smtpConfigured: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [notifyEmail, setNotifyEmail] = useState(user.notifyEmail ?? "");
  const [currency, setCurrency] = useState(user.currency);
  const [leadDays, setLeadDays] = useState(String(user.leadDays));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function resizeAvatar(file: File): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Choose a JPG, PNG or WebP image.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be under 5 MB.");
    }

    const bitmap = await createImageBitmap(file);
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not process that image.");

    const scale = Math.max(size / bitmap.width, size / bitmap.height);
    const width = bitmap.width * scale;
    const height = bitmap.height * scale;
    context.drawImage(
      bitmap,
      (size - width) / 2,
      (size - height) / 2,
      width,
      height,
    );
    bitmap.close();

    return canvas.toDataURL("image/jpeg", 0.85);
  }

  async function onAvatarSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const dataUrl = await resizeAvatar(file);
      setAvatar(dataUrl);
      setErrors((current) => ({ ...current, avatar: "" }));
    } catch (error) {
      toast({
        title: "Could not use that image",
        description:
          error instanceof Error ? error.message : "Please try another image.",
        variant: "error",
      });
    }
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

  const [sendingTest, setSendingTest] = useState(false);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          avatar: avatar || null,
          notifyEmail: notifyEmail.trim() || null,
          currency,
          leadDays: Number(leadDays),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        toast({
          title: "Could not save settings",
          description: data.error ?? "Please check the form and try again.",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Settings saved",
        description: "Your reminders will use these preferences going forward.",
      });
      router.refresh();
    } catch {
      toast({
        title: "Network error",
        description: "Please try again.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordErrors({});

    if (newPassword.length < 8) {
      setPasswordErrors({
        newPassword: "Password must be at least 8 characters",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPasswordErrors(data.fieldErrors ?? {});
        toast({
          title: "Could not update password",
          description: data.error ?? "Please try again.",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Password updated",
        description: "Use your new password next time you sign in.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({
        title: "Network error",
        description: "Please try again.",
        variant: "error",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  async function sendTest() {
    setSendingTest(true);
    try {
      const response = await fetch("/api/settings/test-email", {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));

      if (data.delivered) {
        toast({ title: "Test email sent", description: `Check ${data.to}.` });
      } else {
        toast({
          title: data.notConfigured
            ? "Email delivery is not configured"
            : "Test email failed",
          description:
            data.message ??
            "Add SMTP credentials to .env to send live reminders. In-app reminders still work.",
          variant: data.notConfigured ? "info" : "error",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Please try again.",
        variant: "error",
      });
    } finally {
      setSendingTest(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      <header className="relative overflow-hidden rounded-[1.9rem] border border-line-strong bg-gradient-to-br from-[#111b31] via-ink-900 to-[#0a191c] p-6 sm:p-8">
        <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-violet/20 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-28 right-0 size-72 rounded-full bg-mint/10 blur-[100px]" />
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-20 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet/25 bg-violet/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-soft">
              <Sparkles className="size-3" />
              Account control
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Settings<span className="text-gradient">.</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              Fine-tune your profile, reminder delivery and security from one
              calm, considered place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.04] px-3 py-2 text-[11px] font-medium text-slate-300">
              <BadgeCheck className="size-3.5 text-mint" />
              {smtpConfigured ? "Live email active" : "In-app reminders"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.04] px-3 py-2 text-[11px] font-medium text-slate-300">
              <Wallet className="size-3.5 text-violet-soft" />
              {currency}
            </span>
          </div>
        </div>
      </header>

      <form
        onSubmit={saveSettings}
        className="glass-card border-gradient relative space-y-5 overflow-hidden rounded-3xl p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-violet/10 blur-3xl" />
        <div className="relative space-y-5">
          <SectionTitle
            icon={<User className="size-4" />}
            eyebrow="01 — Identity"
            title="Profile & preferences"
            description="How your name, currency and default reminder window are shown."
          />

          <div className="h-px bg-gradient-to-r from-violet/40 via-line to-transparent" />

          <div className="flex flex-col gap-4 rounded-2xl border border-line/80 bg-gradient-to-r from-white/[0.045] to-transparent p-4 sm:flex-row sm:items-center">
            <Avatar
              name={name.trim() || user.name}
              avatar={avatar}
              className="size-16 ring-2 ring-white/10"
              textClassName="text-lg"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white">Profile photo</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                JPG, PNG or WebP up to 5 MB. Square images work best.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={onAvatarSelected}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-violet/30 bg-violet/15 px-2.5 py-1.5 text-[11px] font-semibold text-violet-soft transition hover:bg-violet/25"
                >
                  <Camera className="size-3.5" />
                  {avatar ? "Change photo" : "Upload photo"}
                </button>
                {avatar ? (
                  <button
                    type="button"
                    onClick={() => setAvatar("")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:border-rose/30 hover:bg-rose/10 hover:text-rose"
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </button>
                ) : null}
              </div>
              {errors.avatar ? (
                <p className="mt-1 text-[11px] text-rose">{errors.avatar}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <Input
              name="name"
              label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
              autoComplete="name"
              icon={<User className="size-4" />}
            />
            <Input
              name="email"
              label="Sign-in email"
              value={user.email}
              disabled
              hint="Cannot be changed"
            />
            <Input
              name="notifyEmail"
              label="Reminder email"
              type="email"
              placeholder={user.email}
              value={notifyEmail}
              onChange={(event) => setNotifyEmail(event.target.value)}
              error={errors.notifyEmail}
              hint="Gmail works great"
              autoComplete="email"
              icon={<Mail className="size-4" />}
            />
            <Select
              name="currency"
              label="Currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
            <Select
              name="leadDays"
              label="Default reminder window"
              hint="Applies to new bills"
              value={leadDays}
              onChange={(event) => setLeadDays(event.target.value)}
            >
              {[0, 1, 2, 3, 5, 7, 10, 14].map((days) => (
                <option key={days} value={days}>
                  {days === 0
                    ? "On the due date"
                    : `${days} day${days === 1 ? "" : "s"} before due`}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Check className="size-3.5 text-mint" />
              Changes apply to new reminders immediately.
            </p>
            <Button type="submit" loading={saving} className="sm:min-w-40">
              Save changes
            </Button>
          </div>
        </div>
      </form>

      <section className="glass-card border-gradient relative space-y-5 overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-mint/10 blur-3xl" />
        <div className="relative space-y-5">
          <SectionTitle
            icon={<BellRing className="size-4" />}
            eyebrow="02 — Delivery"
            title="Email reminders"
            description="Reminders run automatically every day and are also saved in-app."
          />

          <div
            className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3.5 text-xs leading-relaxed ${
              smtpConfigured
                ? "border-mint/20 bg-mint/[0.06] text-mint-soft"
                : "border-amber/20 bg-amber/[0.06] text-amber"
            }`}
          >
            <span
              className={`mt-1 size-1.5 shrink-0 rounded-full ${
                smtpConfigured ? "bg-mint" : "bg-amber"
              }`}
            />
            <div>
              <p className="font-semibold">
                {smtpConfigured
                  ? "Live email delivery connected"
                  : "Dev mode — email not configured"}
              </p>
              <p className="mt-0.5 opacity-80">
                {smtpConfigured
                  ? `Reminders will be delivered to ${notifyEmail || user.email} before each due date.`
                  : "Emails are logged to the server console and reminders still appear in-app. Add SMTP or Resend credentials to .env to send live email."}
              </p>
            </div>
          </div>

          <ul className="grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
            {[
              "A daily sweep checks every unpaid bill against its reminder window.",
              `Default lead time is ${leadDays} day${Number(leadDays) === 1 ? "" : "s"} — each bill can override it.`,
              "Overdue bills keep reminding for a short grace period until paid.",
              "Marking a recurring bill paid rolls the next due date forward automatically.",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 rounded-xl border border-line/60 bg-white/[0.02] px-3 py-2.5 leading-relaxed"
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-mint" />
                {line}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Mail className="size-3.5" />
              Delivering to{" "}
              <span className="font-medium text-slate-300">
                {notifyEmail || user.email}
              </span>
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={sendTest}
              loading={sendingTest}
              iconLeft={<Send className="size-3.5" />}
            >
              Send test email
            </Button>
          </div>
        </div>
      </section>

      <form
        onSubmit={updatePassword}
        className="glass-card border-gradient relative space-y-5 overflow-hidden rounded-3xl p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-cyan/10 blur-3xl" />
        <div className="relative space-y-5">
          <SectionTitle
            icon={<ShieldCheck className="size-4" />}
            eyebrow="03 — Protection"
            title="Security"
            description="Choose a strong password to keep your account protected."
          />

          <div className="h-px bg-gradient-to-r from-cyan/30 via-line to-transparent" />

          <div className="grid gap-4 sm:grid-cols-1">
            <Input
              name="currentPassword"
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              error={passwordErrors.currentPassword}
              icon={<Lock className="size-4" />}
            />
            <div className="hidden sm:block" />
            <Input
              name="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              error={passwordErrors.newPassword}
              hint="At least 8 characters"
              icon={<Lock className="size-4" />}
            />
            <Input
              name="confirmPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={passwordErrors.confirmPassword}
              icon={<Lock className="size-4" />}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="size-3.5 text-mint" />
              Passwords are hashed with bcrypt and never stored in plain text.
            </p>
            <Button
              type="submit"
              variant="secondary"
              loading={changingPassword}
            >
              Update password
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
