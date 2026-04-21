import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Server, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { PrimaryButton } from "@/shared/components/PrimaryButton";
import type { AuthErrorCode } from "@/modules/auth/api/authApi";

// ─── Validation schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  serverUrl: z
    .string()
    .min(1, "required")
    .refine(
      (val) => {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "invalidUrl" }
    ),
  email: z.string().min(1, "required").email("invalidEmail"),
  password: z.string().min(1, "required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Error message mapping ────────────────────────────────────────────────────

function useErrorMessage(code: AuthErrorCode | null): string | null {
  const { t } = useTranslation();
  if (!code) return null;
  const map: Record<AuthErrorCode, string> = {
    invalidCredentials: t("auth.errors.invalidCredentials"),
    unreachable: t("auth.errors.unreachable"),
    sessionExpired: t("auth.errors.sessionExpired"),
  };
  return map[code] ?? null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, error, clearError, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const errorMessage = useErrorMessage(error);

  const defaultServerUrl = import.meta.env.VITE_DEFAULT_SERVER_URL ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { serverUrl: defaultServerUrl, email: "", password: "" },
  });

  // Already authenticated — send to campaigns
  useEffect(() => {
    if (isAuthenticated) navigate("/campaigns", { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    clearError();
    try {
      await login(values.serverUrl.trim(), values.email.trim(), values.password);
      navigate("/campaigns", { replace: true });
    } catch {
      // error state set in authStore
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-12">
      {/* Logo / branding */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand">
          <span className="text-2xl font-bold text-white">BC</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{t("app.name")}</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">{t("app.tagline")}</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full max-w-sm space-y-4"
      >
        {/* Server URL */}
        <Field
          label={t("auth.serverUrl")}
          icon={<Server className="h-4 w-4" />}
          error={errors.serverUrl?.message === "invalidUrl" ? "Invalid URL format" : errors.serverUrl?.message}
        >
          <input
            {...register("serverUrl")}
            type="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="https://erp.example.com"
            className={inputClass(!!errors.serverUrl)}
          />
        </Field>

        {/* Email */}
        <Field
          label={t("auth.email")}
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message === "invalidEmail" ? "Invalid email address" : errors.email?.message}
        >
          <input
            {...register("email")}
            type="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="you@company.com"
            className={inputClass(!!errors.email)}
          />
        </Field>

        {/* Password */}
        <Field
          label={t("auth.password")}
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
        >
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={clsx(inputClass(!!errors.password), "pe-10")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-[#A0A0A0] hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {/* API / network error banner */}
        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-brand"
          >
            {errorMessage}
          </div>
        )}

        <PrimaryButton type="submit" loading={isSubmitting} className="mt-6">
          {isSubmitting ? t("auth.loggingIn") : t("auth.login")}
        </PrimaryButton>
      </form>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-[#A0A0A0]">
        {icon}
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-brand">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return clsx(
    "w-full rounded-xl border bg-surface-alt px-4 py-3 text-sm text-white placeholder-[#A0A0A0]",
    "outline-none transition-colors focus:ring-2 focus:ring-brand focus:ring-offset-1 focus:ring-offset-black",
    hasError ? "border-brand" : "border-border"
  );
}
