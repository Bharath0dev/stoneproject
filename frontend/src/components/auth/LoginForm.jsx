import React, { useState } from "react";
import { login } from "../../services/api";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8000";

// ── Forgot Password Modal ─────────────────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
  const [step,    setStep]    = useState("email");   // "email" | "sent"
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      // Always show success regardless — avoids email enumeration
      setStep("sent");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-modal">

        <div className="auth-modal-header">
          <div className="auth-modal-title">
            {step === "email" ? "Reset your password" : "Check your email"}
          </div>
          <button className="auth-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="auth-modal-body">
          {step === "email" ? (
            <form onSubmit={handleSend} noValidate>
              <p className="auth-modal-desc">
                Enter the email address you used to sign up. We'll send you a link to reset your password.
              </p>

              {error && <div className="auth-error"><span>⚠️</span> {error}</div>}

              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <input
                  className={`auth-input${error ? " error" : ""}`}
                  type="email"
                  placeholder="you@example.com"
                  autoFocus
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                />
              </div>

              <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: 16 }}>
                {loading ? <><div className="auth-spinner"/> Sending…</> : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="auth-sent-state">
              <div className="auth-sent-icon">📬</div>
              <div className="auth-sent-title">Email sent!</div>
              <div className="auth-sent-desc">
                We've sent a password reset link to <strong>{email}</strong>. Check your inbox — it may take a minute or two.
              </div>
              <div className="auth-sent-hint">Didn't receive it? Check your spam folder.</div>
              <button className="auth-btn" onClick={onClose} style={{ marginTop: 24 }}>
                Back to Login
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ── LoginForm ─────────────────────────────────────────────────────────────────
const LoginForm = ({ onSwitch }) => {
  const [form,         setForm]         = useState({ email: "", password: "" });
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showForgot,   setShowForgot]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   if (!form.email.trim())  { setError("Please enter your email.");    return; }
  //   if (!form.password)      { setError("Please enter your password."); return; }
  //   setLoading(true);
  //   try {
  //     const res = await login(form);
  //     localStorage.setItem("token",   res.data.access_token);
  //     if (res.data.user) localStorage.setItem("st_user", JSON.stringify(res.data.user));
  //     navigate("/home");
  //   } catch (err) {
  //     const msg = err?.response?.data?.detail;
  //     setError(msg || "Invalid email or password. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await login(form);

      const token = res.data.access_token;

      // ✅ Store token
      localStorage.setItem("token", token);

      // ✅ Store user properly
      if (res.data.user) {
        localStorage.setItem("st_user", JSON.stringify(res.data.user));
      } else {
        // ⚠️ fallback (important)
        localStorage.setItem(
          "st_user",
          JSON.stringify({
            email: form.email,
            full_name: form.email.split("@")[0] // temp name
          })
        );
      }

      navigate("/home");

    } catch (err) {
      const msg = err?.response?.data?.detail;
      setError(msg || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Inject modal CSS once */}
      <style>{modalCss}</style>

      <form onSubmit={handleSubmit} noValidate>

        {error && <div className="auth-error"><span>⚠️</span> {error}</div>}

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input
            className={`auth-input${error && !form.email ? " error" : ""}`}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={e => { setForm({ ...form, email: e.target.value }); setError(""); }}
          />
        </div>

        <div className="auth-field">
          {/* Label row — label left, forgot right */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
            <label className="auth-label" style={{ margin: 0 }}>Password</label>
            <button
              type="button"
              className="auth-forgot-btn"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </div>

          {/* Password input with show/hide toggle */}
          <div className="auth-input-wrap">
            <input
              className={`auth-input auth-input-pw${error && !form.password ? " error" : ""}`}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={e => { setForm({ ...form, password: e.target.value }); setError(""); }}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword(p => !p)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? <><div className="auth-spinner"/> Logging in…</> : "Login"}
        </button>

        <div className="auth-switch">
          Don't have an account?
          <button type="button" onClick={onSwitch}>Sign up</button>
        </div>
      </form>

      {/* Forgot password modal */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  );
};

// ── Modal CSS (injected once alongside form) ──────────────────────────────────
const modalCss = `
  /* Forgot btn */
  .auth-forgot-btn {
    border:none; background:none; color:#3B82F6;
    font-size:12px; font-weight:600; cursor:pointer;
    font-family:'DM Sans',sans-serif; padding:0;
    transition:color .15s; white-space:nowrap;
  }
  .auth-forgot-btn:hover { color:#1D4ED8; text-decoration:underline; }

  /* Password input wrapper */
  .auth-input-wrap { position:relative; }
  .auth-input-pw   { padding-right:44px !important; }
  .auth-eye-btn {
    position:absolute; right:12px; top:50%; transform:translateY(-50%);
    border:none; background:none; cursor:pointer; font-size:16px;
    display:flex; align-items:center; padding:0; line-height:1;
    opacity:.7; transition:opacity .15s;
  }
  .auth-eye-btn:hover { opacity:1; }

  /* Modal backdrop */
  .auth-backdrop {
    position:fixed; inset:0; background:rgba(15,20,30,.45);
    z-index:600; display:flex; align-items:center; justify-content:center;
    padding:20px; animation:authFadeIn .15s ease;
  }

  /* Modal box */
  .auth-modal {
    background:white; border-radius:18px; width:100%; max-width:400px;
    box-shadow:0 20px 60px rgba(0,0,0,.18);
    animation:authModalUp .2s ease; overflow:hidden;
  }
  .auth-modal-header {
    padding:22px 24px 16px; border-bottom:1px solid #E8ECF0;
    display:flex; align-items:center; justify-content:space-between;
  }
  .auth-modal-title { font-size:17px; font-weight:700; letter-spacing:-.3px; color:#1A1D23; }
  .auth-modal-close {
    width:30px; height:30px; border-radius:8px; border:none;
    background:#F4F6F9; cursor:pointer; font-size:15px;
    display:flex; align-items:center; justify-content:center;
    transition:background .15s; color:#6B7280;
  }
  .auth-modal-close:hover { background:#E8ECF0; }
  .auth-modal-body { padding:20px 24px 28px; }
  .auth-modal-desc {
    font-size:13px; color:#6B7280; line-height:1.6;
    margin-bottom:18px;
  }

  /* Sent state */
  .auth-sent-state { text-align:center; }
  .auth-sent-icon  { font-size:48px; margin-bottom:12px; }
  .auth-sent-title { font-size:18px; font-weight:700; color:#1A1D23; margin-bottom:8px; }
  .auth-sent-desc  { font-size:13px; color:#6B7280; line-height:1.6; margin-bottom:6px; }
  .auth-sent-hint  { font-size:12px; color:#9CA3AF; }

  @keyframes authFadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes authModalUp {
    from { opacity:0; transform:translateY(16px) scale(.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
`;

export default LoginForm;