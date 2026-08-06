import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "../../api/auth.api";
import { apiError } from "../../api/client";
import { FormField, Input } from "../../components/common/FormField";
import { useAuthStore } from "../../store/auth";
const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Use at least 6 characters"),
});
const registerSchema = loginSchema.extend({
  full_name: z.string().trim().min(2, "Enter your full name"),
  mobile: z.string().regex(/^\+?[0-9]{10,15}$/, "Enter a valid mobile number"),
});
function AuthShell({ children, title, subtitle }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_.85fr]">
      <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[#0d1720] p-12 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="text-xl font-black">
          <span className="mr-2 inline-grid h-9 w-9 place-items-center rounded-lg bg-coral">
            L
          </span>
          LUMINA
        </Link>
        <div className="relative z-10 max-w-xl">
          <p className="eyebrow">Your next obsession awaits</p>
          <h2 className="mt-5 font-display text-6xl leading-[1.05]">
            Stories that stay after the credits.
          </h2>
          <p className="mt-6 max-w-md text-lg text-mist">
            A curated screen for bold cinema, unhurried documentaries, and
            series worth losing sleep over.
          </p>
        </div>
        <p className="text-sm text-mist">Watch anywhere. Pause whenever.</p>
        <div className="absolute -bottom-24 -right-20 h-[520px] w-[520px] rounded-full bg-coral/15 blur-3xl" />
      </aside>
      <main className="grid place-items-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-mist hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Lumina
          </Link>
          <h1 className="font-display text-4xl">{title}</h1>
          <p className="mt-2 text-mist">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        className="absolute right-3 top-3 text-mist"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  );
}
export function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      setSession(user);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}`);
      const from = location.state?.from?.pathname;
      nav(from || (user.role === "ADMIN" ? "/admin" : "/browse"), {
        replace: true,
      });
    },
    onError: (e) => toast.error(apiError(e)),
  });
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
    >
      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
      >
        <FormField label="Email address" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
          />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <PasswordInput
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
          />
        </FormField>
        <button className="btn-primary w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-mist">
        New to Lumina?{" "}
        <Link className="font-semibold text-coral" to="/register">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
export function RegisterPage() {
  const nav = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });
  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => {
      setSession(user);
      toast.success("Your account is ready");
      nav("/profiles", { replace: true });
    },
    onError: (e) => toast.error(apiError(e)),
  });
  return (
    <AuthShell
      title="Join Lumina"
      subtitle="One account. A world of unforgettable stories."
    >
      <form
        className="mt-8 space-y-4"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
      >
        <FormField label="Full name" error={errors.full_name?.message}>
          <Input autoComplete="name" {...register("full_name")} />
        </FormField>
        <FormField label="Email address" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register("email")} />
        </FormField>
        <FormField label="Mobile" error={errors.mobile?.message}>
          <Input
            inputMode="tel"
            placeholder="9876543210"
            {...register("mobile")}
          />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <PasswordInput
            autoComplete="new-password"
            {...register("password")}
          />
        </FormField>
        <button className="btn-primary w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-mist">
        Already a member?{" "}
        <Link className="font-semibold text-coral" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
