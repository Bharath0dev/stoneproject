import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8000";

/* ================= BASE CSS ================= */
const baseCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .st-root {
    --green: #159A6F;
    --green-mid: #1CB884;
    --green-light: #E6F7F2;
    --green-glow: rgba(21,154,111,0.15);
    --red: #C94B27;
    --red-light: #FEF0EB;
    --red-border: #F5C5B4;
    --bg: #F0F3F7;
    --bg2: #E8ECF2;
    --border: #DDE3EC;
    --border-light: #EEF1F6;
    --text: #151A24;
    --muted: #5C6475;
    --subtle: #9AA0AE;
    --white: #FFFFFF;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04);
    --shadow-lg: 0 8px 32px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06);

    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  .st-page {
    padding: 32px 28px;
    max-width: 1040px;
    margin: 0 auto;
  }

  .st-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    color: var(--text);
    background: var(--bg);
    transition: border-color .2s, box-shadow .2s, background .2s;
    outline: none;
  }
  .st-input:focus {
    border-color: var(--green);
    background: var(--white);
    box-shadow: 0 0 0 3px var(--green-glow);
  }
  .st-input::placeholder { color: var(--subtle); }

  .st-btn-primary {
    background: var(--green);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 11px 20px;
    font-weight: 700;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    transition: background .18s, transform .15s, box-shadow .18s;
    box-shadow: 0 2px 8px rgba(21,154,111,.30);
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .st-btn-primary:hover {
    background: #117A58;
    box-shadow: 0 4px 16px rgba(21,154,111,.35);
    transform: translateY(-1px);
  }
  .st-btn-primary:active { transform: translateY(0); }

  .st-btn-ghost {
    background: transparent;
    color: var(--green);
    border: 1.5px solid var(--green);
    border-radius: 9px;
    padding: 7px 15px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background .18s, color .18s;
  }
  .st-btn-ghost:hover {
    background: var(--green-light);
  }

  .st-btn-cancel {
    background: var(--bg2);
    color: var(--muted);
    border: 1.5px solid var(--border);
    border-radius: 9px;
    padding: 7px 15px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background .18s;
  }
  .st-btn-cancel:hover { background: var(--border); }

  .st-btn-danger {
    background: var(--red-light);
    color: var(--red);
    border: 1.5px solid var(--red-border);
    border-radius: 9px;
    padding: 9px 18px;
    font-size: 13px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: background .18s, transform .15s;
  }
  .st-btn-danger:hover {
    background: #fde4db;
    transform: translateY(-1px);
  }

  .st-label {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--subtle);
    letter-spacing: .06em;
    text-transform: uppercase;
    margin-bottom: 5px;
    display: block;
  }

  .st-field { margin-bottom: 14px; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ================= PROFILE CSS ================= */
const profileCss = `
  /* BACK */
  .st-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 24px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: var(--muted);
    font-family: inherit;
    padding: 6px 10px;
    border-radius: 8px;
    transition: color .18s, background .18s;
  }
  .st-back-btn:hover { color: var(--text); background: var(--border-light); }
  .st-back-arrow { font-size: 15px; line-height: 1; }

  /* HERO */
  .st-profile-hero {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 28px 28px;
    display: flex;
    align-items: center;
    gap: 22px;
    margin-bottom: 22px;
    box-shadow: var(--shadow-sm);
    animation: fadeUp .4s ease both;
  }

  .st-profile-hero-avatar {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--green-mid), var(--green));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 800;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(21,154,111,.30);
    letter-spacing: -.5px;
  }

  .st-profile-hero-info { flex: 1; }
  .st-profile-hero-name {
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
    line-height: 1.2;
    margin-bottom: 4px;
  }
  .st-profile-hero-email {
    font-size: 13px;
    color: var(--muted);
    font-weight: 500;
  }

  .st-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--green-light);
    color: var(--green);
    font-size: 11.5px;
    font-weight: 700;
    padding: 4px 11px;
    border-radius: 99px;
    margin-top: 8px;
  }
  .st-hero-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--green);
    display: inline-block;
  }

  /* GRID */
  .st-profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  /* CARD */
  .st-section-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    animation: fadeUp .4s ease both;
  }
  .st-section-card:nth-child(2) { animation-delay: .07s; }

  .st-section-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #FAFBFD;
  }
  .st-section-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .st-section-icon {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: var(--green-light);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }

  .st-section-body { padding: 20px; }

  /* INFO ROWS */
  .st-info-row {
    display: flex;
    align-items: flex-start;
    padding: 13px 0;
    border-bottom: 1px solid var(--border-light);
  }
  .st-info-row:last-child { border-bottom: none; padding-bottom: 4px; }

  .st-info-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .st-info-content { flex: 1; }
  .st-info-label {
    font-size: 10.5px;
    font-weight: 700;
    color: var(--subtle);
    letter-spacing: .07em;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .st-info-val {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
  }
  .st-info-val.empty { color: var(--subtle); font-style: italic; }

  /* EDIT FORM */
  .st-edit-form { display: flex; flex-direction: column; gap: 12px; }
  .st-edit-actions { display: flex; gap: 8px; margin-top: 4px; }

  /* PASSWORD FORM */
  .st-pwd-form { display: flex; flex-direction: column; gap: 12px; }
  .st-pwd-strength {
    height: 3px;
    border-radius: 99px;
    background: var(--border);
    overflow: hidden;
    margin-top: -6px;
  }
  .st-pwd-strength-bar {
    height: 100%;
    border-radius: 99px;
    transition: width .3s, background .3s;
  }

  /* DELETE CARD */
  .st-delete-card {
    background: var(--white);
    border: 1px solid var(--red-border);
    padding: 18px 22px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--shadow-sm);
    animation: fadeUp .4s .14s ease both;
  }
  .st-delete-info {}
  .st-delete-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--red);
    margin-bottom: 3px;
  }
  .st-delete-desc {
    font-size: 12px;
    color: var(--muted);
  }
`;

/* ================= HELPER ================= */
const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2);

const pwdStrength = (pwd) => {
  if (!pwd) return { w: 0, color: "transparent", label: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { w: "25%", color: "#E55A3A", label: "Weak" },
    { w: "50%", color: "#F59E0B", label: "Fair" },
    { w: "75%", color: "#3B82F6", label: "Good" },
    { w: "100%", color: "#159A6F", label: "Strong" },
  ];
  return map[score - 1] || { w: 0, color: "transparent", label: "" };
};

/* ================= COMPONENT ================= */
const ProfilePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("st_user") || "{}");

  const [name, setName] = useState(user.full_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [edit, setEdit] = useState(false);

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const strength = pwdStrength(pwd.next);

  const showToast = (msg) => alert(msg);

  const saveProfile = () => {
    if (!name.trim()) return showToast("Name required");
    const updated = { ...user, full_name: name, email, phone };
    localStorage.setItem("st_user", JSON.stringify(updated));
    setEdit(false);
    showToast("Profile updated");
  };

  const changePassword = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) return showToast("Fill all fields");
    if (pwd.next !== pwd.confirm) return showToast("Passwords don't match");
    await fetch(`${BASE_URL}/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ current_password: pwd.current, new_password: pwd.next }),
    });
    showToast("Password updated");
    setPwd({ current: "", next: "", confirm: "" });
  };

  return (
    <>
      <style>{baseCss}</style>
      <style>{profileCss}</style>

      <div className="st-root">
        <div className="st-page">

          {/* BACK */}
          <button className="st-back-btn" onClick={() => navigate("/home")}>
            <span className="st-back-arrow">←</span> Back to Dashboard
          </button>

          {/* HERO */}
          <div className="st-profile-hero">
            <div className="st-profile-hero-avatar">{getInitials(name)}</div>
            <div className="st-profile-hero-info">
              <div className="st-profile-hero-name">{name || "—"}</div>
              <div className="st-profile-hero-email">{email}</div>
              <div className="st-hero-badge">
                <span className="st-hero-badge-dot" /> Active Account
              </div>
            </div>
          </div>

          {/* GRID */}
          <div className="st-profile-grid">

            {/* PERSONAL INFO */}
            <div className="st-section-card">
              <div className="st-section-header">
                <div className="st-section-title">
                  <div className="st-section-icon">👤</div>
                  Personal Info
                </div>
                {edit
                  ? <button className="st-btn-cancel" onClick={() => setEdit(false)}>Cancel</button>
                  : <button className="st-btn-ghost" onClick={() => setEdit(true)}>Edit</button>
                }
              </div>

              <div className="st-section-body">
                {edit ? (
                  <div className="st-edit-form">
                    <div>
                      <label className="st-label">Full Name</label>
                      <input className="st-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                      <label className="st-label">Email Address</label>
                      <input className="st-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className="st-label">Phone Number</label>
                      <input className="st-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 00000 00000" />
                    </div>
                    <div className="st-edit-actions">
                      <button className="st-btn-primary" onClick={saveProfile}>Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="st-info-row">
                      <div className="st-info-icon">✏️</div>
                      <div className="st-info-content">
                        <div className="st-info-label">Full Name</div>
                        <div className="st-info-val">{name || <span className="empty">Not set</span>}</div>
                      </div>
                    </div>
                    <div className="st-info-row">
                      <div className="st-info-icon">📧</div>
                      <div className="st-info-content">
                        <div className="st-info-label">Email Address</div>
                        <div className="st-info-val">{email || <span className="empty">Not set</span>}</div>
                      </div>
                    </div>
                    <div className="st-info-row">
                      <div className="st-info-icon">📱</div>
                      <div className="st-info-content">
                        <div className="st-info-label">Phone Number</div>
                        <div className={`st-info-val${!phone ? " empty" : ""}`}>{phone || "Not set"}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* CHANGE PASSWORD */}
            <div className="st-section-card">
              <div className="st-section-header">
                <div className="st-section-title">
                  <div className="st-section-icon">🔒</div>
                  Change Password
                </div>
              </div>

              <div className="st-section-body">
                <div className="st-pwd-form">
                  <div>
                    <label className="st-label">Current Password</label>
                    <input className="st-input" type="password" placeholder="Enter current password"
                      value={pwd.current} onChange={e => setPwd({ ...pwd, current: e.target.value })} />
                  </div>
                  <div>
                    <label className="st-label">New Password</label>
                    <input className="st-input" type="password" placeholder="Enter new password"
                      value={pwd.next} onChange={e => setPwd({ ...pwd, next: e.target.value })} />
                    {pwd.next && (
                      <div style={{ marginTop: 6 }}>
                        <div className="st-pwd-strength">
                          <div className="st-pwd-strength-bar" style={{ width: strength.w, background: strength.color }} />
                        </div>
                        <div style={{ fontSize: 11, color: strength.color, fontWeight: 600, marginTop: 4 }}>{strength.label}</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="st-label">Confirm New Password</label>
                    <input className="st-input" type="password" placeholder="Confirm new password"
                      value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} />
                  </div>
                  <button className="st-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={changePassword}>
                    🔑 Update Password
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* DELETE */}
          <div className="st-delete-card">
            <div className="st-delete-info">
              <div className="st-delete-title">Delete Account</div>
              <div className="st-delete-desc">Permanently remove your account and all associated data.</div>
            </div>
            <button className="st-btn-danger">Delete Account</button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProfilePage;