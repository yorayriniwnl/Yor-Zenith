"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import SolarRoof from "./SolarRoof";

export default function LoginForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(
          data.error || "Sign-in failed. Check your email and password.",
        );
        return;
      }
      window.dispatchEvent(new Event("auth-changed"));
      router.replace(returnTo);
      router.refresh();
    } catch {
      setError("We could not reach the sign-in service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="studio login-studio">
      <div className="login-layout">
        <section className="login-story" aria-labelledby="login-story-heading">
          <Link href="/" className="login-back">
            <ArrowLeft size={15} aria-hidden="true" />
            Back to the studio
          </Link>
          <div>
            <p className="studio-eyebrow">YOUR NEXT CHAPTER</p>
            <h2 id="login-story-heading">
              A brighter plan
              <br />
              starts here.
            </h2>
            <p>
              Pick up your project. Question the assumptions. Find your next
              move.
            </p>
          </div>
          <div className="login-roof">
            <SolarRoof dark />
            <span>THE SOLAR DECISION STUDIO</span>
          </div>
          <p className="login-story-note">
            <ShieldCheck size={16} aria-hidden="true" />
            Visible inputs. Considered decisions.
          </p>
        </section>
        <section className="login-form-panel" aria-labelledby="login-heading">
          <span className="login-lock">
            <LockKeyhole size={21} aria-hidden="true" />
          </span>
          <p className="studio-eyebrow">PRIVATE BETA ACCESS</p>
          <h1 id="login-heading">Welcome to Zenith.</h1>
          <p className="login-intro">
            Sign in with your workspace invitation to continue.
          </p>
          <form
            onSubmit={(event) => void handleLogin(event)}
            aria-busy={isSubmitting}
          >
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              disabled={isSubmitting}
            />
            <label htmlFor="password">Password</label>
            <div className="login-password">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
            {error && (
              <p role="alert" className="login-error">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="studio-button studio-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    className="animate-spin"
                    size={17}
                    aria-hidden="true"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Enter your workspace
                  <ArrowUpRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
          <div className="login-access-note">
            <strong>Do not have access yet?</strong>
            <p>
              Ask your workspace administrator for an invitation. Public account
              registration is not available in this beta.
            </p>
            <Link href="/#get-started">
              Try the interactive sample
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="login-legal">
            <Link href="/privacy">Privacy notice</Link>
            <span>·</span>
            <Link href="/terms">Terms of use</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
