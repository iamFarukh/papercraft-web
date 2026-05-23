import { FirebaseError } from "firebase/app";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { assertFirebaseConfigured } from "@/lib/firebase";

function formatAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Contact your administrator.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Login ID or password is incorrect.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      default:
        return "Unable to sign in. Please check your credentials and try again.";
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      assertFirebaseConfigured();
      await login(email, password, remember);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pc-login-page">
      <section className="pc-login-hero" aria-hidden={false}>
        <div className="pc-login-hero-inner">
          <div className="pc-brand" style={{ padding: 0, marginBottom: 48 }}>
            <div className="pc-brand-mark" aria-hidden />
            <div>
              <div className="pc-brand-name">
                Paper<em>Craft</em>
              </div>
              <div className="pc-brand-sub">Editorial Academic OS</div>
            </div>
          </div>

          <p className="pc-login-hero-kicker">
            For schools &amp; examination offices
          </p>
          <h1 className="pc-login-hero-title">
            Compose papers with <em>clarity and control.</em>
          </h1>
          <p className="pc-login-hero-lead">
            Question banks, blueprints, approvals, and print-ready papers — in
            one calm workspace built for Indian state-board academics.
          </p>
        </div>

        <p className="pc-login-hero-quote">
          “Precision in assessment begins long before the examination hall.”
        </p>
      </section>

      <section className="pc-login-panel-wrap">
        <div className="pc-login-panel">
          <div className="pc-login-panel-head">
            <h2>Sign in</h2>
            <p>
              Use the login ID and password your administrator created for you.
              No email is sent — this is your school sign-in only.
            </p>
          </div>

          {error && (
            <div className="pc-login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="pc-login-field">
              <label htmlFor="email">Login ID</label>
              <input
                id="email"
                className="pc-login-input"
                type="text"
                name="email"
                autoComplete="username"
                placeholder="jitu@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="pc-login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="pc-login-input"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="pc-login-row">
              <label className="pc-login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={submitting}
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="pc-login-submit"
              disabled={submitting || !email || !password}
            >
              {submitting ? "Signing in…" : "Sign in to PaperCraft"}
            </button>
          </form>

          <p className="pc-login-footnote">
            Accounts are created by your administrator with a login ID and password.
            Self-registration is not available.
          </p>
        </div>
      </section>
    </div>
  );
}
