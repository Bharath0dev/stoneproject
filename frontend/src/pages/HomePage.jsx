import React, { useEffect, useState, useRef, useCallback } from "react";

const BASE_URL = "http://localhost:8000";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .st-root {
    --green:#1D9E75; --green-light:#E1F5EE; --green-mid:#b8e8d4;
    --red:#D85A30;   --red-light:#FFF0EB;
    --bg:#F4F6F9; --border:#E8ECF0; --text:#1A1D23;
    --muted:#6B7280; --subtle:#9CA3AF;
    font-family:'DM Sans',sans-serif; background:var(--bg);
    color:var(--text); min-height:100vh;
  }

  /* Topbar */
  .st-topbar {
    background:white; border-bottom:1px solid var(--border);
    padding:0 28px; display:flex; align-items:center; gap:20px;
    height:60px; position:sticky; top:0; z-index:200;
  }
  .st-logo { font-size:20px; font-weight:700; color:var(--green); letter-spacing:-.5px; }
  .st-logo span { color:var(--text); }
  .st-nav { display:flex; gap:4px; }
  .st-nav-btn {
    padding:7px 16px; border-radius:8px; border:none; background:none;
    font-size:14px; font-weight:500; color:var(--muted); cursor:pointer;
    font-family:'DM Sans',sans-serif; transition:all .15s;
  }
  .st-nav-btn:hover { background:var(--bg); color:var(--text); }
  .st-nav-btn.active { background:var(--green-light); color:var(--green); font-weight:600; }
  .st-topbar-right { margin-left:auto; display:flex; align-items:center; gap:10px; }
  .st-month-badge {
    font-size:13px; color:var(--muted); background:var(--bg);
    padding:5px 12px; border-radius:20px; font-weight:500;
  }

  /* Profile */
  .st-profile-wrap { position:relative; }
  .st-avatar {
    width:36px; height:36px; border-radius:50%; background:var(--green);
    color:white; font-weight:700; font-size:13px; display:flex;
    align-items:center; justify-content:center; cursor:pointer;
    border:2px solid transparent; transition:all .15s; flex-shrink:0;
    user-select:none; letter-spacing:0;
  }
  .st-avatar:hover { border-color:var(--green-mid); }
  .st-avatar.open   { border-color:var(--green); box-shadow:0 0 0 3px var(--green-light); }
  .st-profile-dropdown {
    position:absolute; top:calc(100% + 10px); right:0;
    background:white; border:1px solid var(--border); border-radius:14px;
    box-shadow:0 12px 40px rgba(0,0,0,.13); width:240px; z-index:400;
    animation:slideUp .15s ease; overflow:hidden;
  }
  .st-profile-top {
    padding:16px 18px 14px; border-bottom:1px solid var(--border);
    display:flex; align-items:center; gap:12px;
  }
  .st-profile-avatar-lg {
    width:44px; height:44px; border-radius:50%; background:var(--green);
    color:white; font-weight:700; font-size:16px; display:flex;
    align-items:center; justify-content:center; flex-shrink:0;
  }
  .st-profile-name  { font-size:14px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .st-profile-email { font-size:11px; color:var(--muted); margin-top:2px; word-break:break-all; }
  .st-profile-menu  { padding:6px; }
  .st-profile-item {
    display:flex; align-items:center; gap:10px; padding:9px 12px;
    border-radius:8px; cursor:pointer; font-size:13px; font-weight:500;
    color:var(--text); transition:background .12s; border:none; background:none;
    width:100%; text-align:left; font-family:'DM Sans',sans-serif;
  }
  .st-profile-item:hover { background:var(--bg); }
  .st-profile-item.danger { color:var(--red); }
  .st-profile-item.danger:hover { background:var(--red-light); }
  .st-profile-item-icon { font-size:16px; flex-shrink:0; width:20px; text-align:center; }
  .st-profile-divider { height:1px; background:var(--border); margin:4px 6px; }

  /* Page */
  .st-page { padding:28px; max-width:1280px; margin:0 auto; }

  /* Metrics */
  .st-metrics { display:grid; gap:14px; margin-bottom:24px; }
  .st-metrics-4 { grid-template-columns:repeat(4,1fr); }
  .st-metric-card {
    background:white; border-radius:14px; padding:18px 20px;
    border:1px solid var(--border); animation:fadeUp .3s ease both;
  }
  .st-metric-label { font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; }
  .st-metric-val { font-size:28px; font-weight:700; margin:6px 0 4px; letter-spacing:-1px; font-family:'DM Mono',monospace; }
  .st-metric-val.green { color:var(--green); }
  .st-metric-val.red   { color:var(--red); }
  .st-metric-val.neutral { color:var(--text); }
  .st-metric-sub { font-size:12px; color:var(--subtle); }
  .st-pill { display:inline-block; margin-top:6px; font-size:11px; font-weight:600; padding:3px 8px; border-radius:20px; }
  .st-pill-up   { background:#ECFDF5; color:#059669; }
  .st-pill-down { background:#FEF2F2; color:#DC2626; }
  .st-budget-track { height:5px; background:var(--border); border-radius:10px; overflow:hidden; margin-top:8px; }
  .st-budget-fill { height:100%; border-radius:10px; transition:width .6s ease; }
  .st-budget-fill.safe { background:var(--green); }
  .st-budget-fill.warn { background:#F59E0B; }
  .st-budget-fill.over { background:var(--red); }

  /* Cards */
  .st-card { background:white; border-radius:14px; border:1px solid var(--border); overflow:hidden; animation:fadeUp .3s ease both; }
  .st-card-header { padding:16px 18px 13px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); }
  .st-card-title { font-size:14px; font-weight:700; }
  .st-card-subtitle { font-size:12px; color:var(--muted); }
  .st-card-body { padding:14px 18px; }

  /* Grid */
  .st-two-col { display:grid; gap:20px; }
  .st-two-col-5050 { grid-template-columns:1fr 1fr; }
  .st-three-col { display:grid; gap:20px; grid-template-columns:1fr 1fr 1fr; }

  /* Buttons */
  .st-btn-primary {
    padding:8px 16px; background:var(--green); color:white; border:none;
    border-radius:8px; font-size:13px; font-weight:700; cursor:pointer;
    font-family:'DM Sans',sans-serif; transition:opacity .15s;
    display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
  }
  .st-btn-primary:hover { opacity:.9; }
  .st-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
  .st-btn-secondary {
    padding:8px 16px; background:white; color:var(--text);
    border:1px solid var(--border); border-radius:8px; font-size:13px;
    font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;
    transition:all .15s; display:inline-flex; align-items:center; gap:6px;
  }
  .st-btn-secondary:hover { border-color:var(--green); color:var(--green); }
  .st-btn-danger {
    padding:8px 16px; background:var(--red-light); color:var(--red);
    border:1px solid var(--red); border-radius:8px; font-size:13px;
    font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif;
    transition:opacity .15s;
  }
  .st-btn-danger:hover { opacity:.85; }
  .st-icon-btn {
    width:30px; height:30px; border-radius:7px; border:1px solid var(--border);
    background:white; cursor:pointer; display:inline-flex; align-items:center;
    justify-content:center; font-size:13px; transition:all .15s;
  }
  .st-icon-btn.edit:hover { background:#EFF6FF; border-color:#3B82F6; }
  .st-icon-btn.del:hover  { background:var(--red-light); border-color:var(--red); }

  /* Transactions */
  .st-txn-row {
    display:flex; align-items:center; gap:10px; padding:10px 0;
    border-bottom:1px solid var(--border); animation:fadeUp .2s ease both;
  }
  .st-txn-row:last-child { border-bottom:none; }
  .st-txn-icon { width:36px; height:36px; border-radius:10px; background:var(--bg); display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
  .st-txn-info { flex:1; min-width:0; }
  .st-txn-name { font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .st-txn-meta { font-size:11px; color:var(--muted); margin-top:1px; }
  .st-tag { display:inline-block; background:var(--bg); color:var(--muted); font-size:9px; font-weight:700; padding:2px 5px; border-radius:4px; margin-left:3px; text-transform:uppercase; letter-spacing:.3px; }
  .st-txn-amt { font-size:13px; font-weight:700; font-family:'DM Mono',monospace; white-space:nowrap; flex-shrink:0; }
  .st-txn-amt.neg { color:var(--red); }
  .st-txn-actions { display:flex; gap:4px; opacity:0; transition:opacity .15s; }
  .st-txn-row:hover .st-txn-actions { opacity:1; }

  /* Budget rows */
  .st-budget-row { padding:11px 0; border-bottom:1px solid var(--border); }
  .st-budget-row:last-child { border-bottom:none; }
  .st-budget-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .st-budget-name { font-size:13px; font-weight:500; display:flex; align-items:center; gap:6px; }
  .st-budget-nums { font-size:11px; color:var(--muted); font-family:'DM Mono',monospace; }
  .st-budget-edit { opacity:0; transition:opacity .15s; }
  .st-budget-row:hover .st-budget-edit { opacity:1; }

  /* Legend */
  .st-legend-row { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
  .st-legend-dot { width:9px; height:9px; border-radius:2px; flex-shrink:0; }

  /* Empty */
  .st-empty { text-align:center; padding:32px 20px; color:var(--muted); }
  .st-empty-icon { font-size:36px; margin-bottom:10px; }
  .st-empty p { font-size:13px; }

  /* Modal */
  .st-backdrop {
    position:fixed; inset:0; background:rgba(15,20,30,.45);
    z-index:500; display:flex; align-items:center; justify-content:center;
    padding:20px; animation:fadeIn .15s ease;
  }
  .st-modal {
    background:white; border-radius:18px; width:100%; max-width:460px;
    max-height:90vh; overflow-y:auto; box-shadow:0 24px 64px rgba(0,0,0,.18);
    animation:slideUp .2s ease;
  }
  .st-modal-header {
    padding:22px 24px 16px; border-bottom:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
  }
  .st-modal-title { font-size:17px; font-weight:700; letter-spacing:-.3px; }
  .st-modal-close {
    width:32px; height:32px; border-radius:8px; border:none; background:var(--bg);
    cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center;
    transition:background .15s;
  }
  .st-modal-close:hover { background:var(--border); }
  .st-modal-body { padding:20px 24px; }
  .st-modal-footer {
    padding:16px 24px 22px; display:flex; gap:10px;
    border-top:1px solid var(--border);
  }
  .st-modal-footer .st-btn-secondary { flex:1; justify-content:center; }
  .st-modal-footer .st-btn-primary   { flex:2; justify-content:center; padding:11px 16px; font-size:14px; }
  .st-modal-footer .st-btn-danger    { flex:1; justify-content:center; }

  /* Form fields */
  .st-field { margin-bottom:16px; }
  .st-field:last-child { margin-bottom:0; }
  .st-label { display:block; font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:7px; }
  .st-input {
    width:100%; padding:10px 13px; border:2px solid var(--border); border-radius:9px;
    font-size:14px; font-family:'DM Sans',sans-serif; outline:none;
    transition:border-color .15s; background:white; color:var(--text);
  }
  .st-input:focus { border-color:var(--green); }
  .st-select {
    width:100%; padding:10px 13px; border:2px solid var(--border); border-radius:9px;
    font-size:14px; font-family:'DM Sans',sans-serif; outline:none;
    transition:border-color .15s; background:white; color:var(--text); cursor:pointer;
  }
  .st-select:focus { border-color:var(--green); }
  .st-field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .st-modal-budget-preview {
    background:var(--bg); border-radius:10px; padding:12px 14px; margin-top:14px;
  }
  .st-modal-budget-preview .label { font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }

  /* Toast */
  .st-toast {
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(10px);
    background:#1A1D23; color:white; padding:11px 18px; border-radius:10px;
    font-size:13px; font-weight:500; opacity:0; pointer-events:none;
    transition:all .25s; z-index:999; white-space:nowrap; max-width:90vw;
  }
  .st-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }

  /* Groups placeholder */
  .st-groups-coming { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 20px; text-align:center; color:var(--muted); }
  .st-groups-coming .g-icon { font-size:52px; margin-bottom:16px; }
  .st-groups-coming h3 { font-size:18px; font-weight:700; color:var(--text); margin-bottom:6px; }

  /* Spinner */
  .st-spinner { display:inline-block; width:15px; height:15px; border:2px solid rgba(255,255,255,.4); border-top-color:white; border-radius:50%; animation:spin .6s linear infinite; }
  .st-spinner.dark { border-color:rgba(0,0,0,.1); border-top-color:var(--green); }

  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(14px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }

  @media(max-width:1024px) { .st-metrics-4 { grid-template-columns:repeat(2,1fr); } .st-metric-val { font-size:22px; } .st-three-col { grid-template-columns:1fr 1fr; } }
  @media(max-width:768px)  { .st-page { padding:16px; } .st-topbar { padding:0 16px; } .st-month-badge { display:none; } .st-two-col-5050 { grid-template-columns:1fr; } .st-three-col { grid-template-columns:1fr; } .st-field-row { grid-template-columns:1fr; } }
  @media(max-width:480px)  { .st-topbar { height:52px; } .st-page { padding:12px; } .st-metric-val { font-size:20px; } .st-metrics-4 { gap:8px; } .st-metric-card { padding:12px 14px; } }
`;

const CAT_ICONS = {
  "Food & Dining":"🍔", Transportation:"🚖", Entertainment:"🎬",
  Shopping:"🛍️", Utilities:"⚡", Rent:"🏠", Groceries:"🛒",
  Healthcare:"🏥", Travel:"✈️", Salary:"💰", Investment:"📈", Other:"💳",
};
const CAT_COLORS = ["#1D9E75","#3B82F6","#F59E0B","#8B5CF6","#EC4899","#6B7280","#EF4444","#14B8A6","#F97316","#A855F7"];
const CATEGORIES = ["Food & Dining","Transportation","Entertainment","Shopping","Utilities","Rent","Groceries","Healthcare","Travel","Salary","Investment","Other"];
const DEFAULT_BUDGETS = { "Food & Dining":4000, Transportation:2500, Entertainment:1000, Groceries:3000, Rent:14000, Utilities:1500 };

const fmtINR = (n) => "₹" + Number(n).toLocaleString("en-IN");
const today  = () => new Date().toISOString().split("T")[0];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.trim().split(" ").filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join("");

// ── SVG Donut ─────────────────────────────────────────────────────────────────
const DonutChart = ({ data }) => {
  if (!data?.length) return null;
  const size=130, cx=65, cy=65, r=48, stroke=18, circ=2*Math.PI*r;
  const total = data.reduce((s,d) => s+d.value, 0);
  let off = 0;
  const slices = data.map((d,i) => {
    const pct=d.value/total, dash=pct*circ, gap=circ-dash;
    const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none"
      stroke={CAT_COLORS[i%CAT_COLORS.length]} strokeWidth={stroke}
      strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off*circ}
      transform={`rotate(-90 ${cx} ${cy})`} style={{transition:"stroke-dasharray .5s ease"}}/>;
    off += pct; return el;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke}/>
      {slices}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="11" fill="#6B7280" fontFamily="DM Sans">total</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1A1D23" fontFamily="DM Mono">{fmtINR(total)}</text>
    </svg>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="st-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="st-modal">
        <div className="st-modal-header">
          <div className="st-modal-title">{title}</div>
          <button className="st-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="st-modal-body">{children}</div>
        {footer && <div className="st-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};


import { useNavigate } from "react-router-dom";

// ── ProfileDropdown ───────────────────────────────────────────────────────────
const ProfileDropdown = ({ onLogout, onAddIncome, onSetMonthlyBudget }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Read user info from localStorage (set during login)
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("st_user") || "{}"); }
    catch { return {}; }
  })();

  const name  = user.full_name || user.name || "User";
  const email = user.email || "";
  const initials = getInitials(name);

  // Close on outside click
  useEffect(() => {
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="st-profile-wrap" ref={wrapRef}>
      {/* Avatar button */}
      <div
        className={`st-avatar${open ? " open" : ""}`}
        onClick={() => setOpen(o => !o)}
        title={name}
      >
        {initials}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="st-profile-dropdown">
          {/* Name + email header */}
          <div className="st-profile-top">
            <div className="st-profile-avatar-lg">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="st-profile-name">{name}</div>
              {email && <div className="st-profile-email">{email}</div>}
            </div>
          </div>

          {/* Menu items */}
          <div className="st-profile-menu">
            {/* <button className="st-profile-item" onClick={() => setOpen(false)}>
              <span className="st-profile-item-icon">👤</span> My Profile
            </button> */}
            <button
              className="st-profile-item"
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}
            >
              <span className="st-profile-item-icon">👤</span> My Profile
            </button>
            {/* <button className="st-profile-item" onClick={() => setOpen(false)}>
              <span className="st-profile-item-icon">⚙️</span> Settings
            </button> */}
            <button
              className="st-profile-item"
              onClick={() => { setOpen(false); onAddIncome(); }}
            >
              <span className="st-profile-item-icon">💰</span> Add Income
            </button>
            <button
              className="st-profile-item"
              onClick={() => { setOpen(false); onSetMonthlyBudget(); }}
            >
              <span className="st-profile-item-icon">📊</span> Set Monthly Budget
            </button>

            <div className="st-profile-divider" />
            <button
              className="st-profile-item danger"
              onClick={() => { setOpen(false); onLogout(); }}
            >
              <span className="st-profile-item-icon">🚪</span> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── HomePage ──────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [expenses,    setExpenses]    = useState([]);
  const [budgets,     setBudgets]     = useState(DEFAULT_BUDGETS);
  const [activeTab,   setActiveTab]   = useState("personal");
  const [loading,     setLoading]     = useState(false);
  const [toastMsg,    setToastMsg]    = useState("");
  const [toastOn,     setToastOn]     = useState(false);
  const toastTimer = useRef(null);

  const [expModal,    setExpModal]    = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);
  const [saving,      setSaving]      = useState(false);

  const [incomeModal, setIncomeModal] = useState(false);
  // const [income, setIncome] = useState(0); // default
  const [incomeByMonth, setIncomeByMonth] = useState({});
  const [incomeInput, setIncomeInput] = useState("");

  const [monthlyBudget, setMonthlyBudget] = useState({});
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState("");
  const [monthlyBudgetModal, setMonthlyBudgetModal] = useState(false);


  const BLANK_EXP = { id:null, amount:"", description:"", category:"", date:today() };
  const [expForm, setExpForm] = useState(BLANK_EXP);

  const BLANK_BUD = { category:"", limit:"" };
  const [budForm, setBudForm] = useState(BLANK_BUD);

  const token = localStorage.getItem("token");

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToastMsg(msg); setToastOn(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 3000);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  // const handleLogout = useCallback(() => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("st_user");
  //   // If you have a router, use navigate("/login") here instead
  //   window.location.href = "/login";
  // }, []);
  const handleLogout = useCallback(() => {
    localStorage.clear(); // clears everything safely
    window.location.replace("/"); // better than href
  }, []);

  // ── Load expenses ─────────────────────────────────────────────────────────
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/expenses`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch { showToast("❌ Failed to load expenses"); }
    finally  { setLoading(false); }
  }, [token, showToast]);

  useEffect(() => { if (activeTab === "personal") loadExpenses(); }, [activeTab]);

  // ── Expense modal ─────────────────────────────────────────────────────────
  const openAddExpense  = ()    => { setExpForm(BLANK_EXP); setExpModal(true); };
  const openEditExpense = (exp) => {
    setExpForm({ id:exp.id, amount:parseFloat(exp.amount), description:exp.description, category:exp.category||"", date:exp.date });
    setExpModal(true);
  };

  const handleSaveExpense = async () => {
    const { id, amount, description, category, date } = expForm;
    if (!description.trim() || !amount || !date) { showToast("⚠️ Fill all required fields"); return; }
    setSaving(true);
    try {
      const body = { amount:parseFloat(amount), description:description.trim(), category:category||null, date };
      const res  = await fetch(id ? `${BASE_URL}/expenses/${id}` : `${BASE_URL}/expenses`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setExpModal(false);
      showToast(id ? "✅ Expense updated" : "✅ Expense added");
      await loadExpenses();
    } catch { showToast("❌ Failed to save expense"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await fetch(`${BASE_URL}/expenses/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
      setExpenses(prev => prev.filter(e => e.id !== id));
      showToast("🗑️ Deleted");
    } catch { showToast("❌ Failed to delete"); }
  };

  // ── Budget modal ──────────────────────────────────────────────────────────
  const openAddBudget   = ()           => { setBudForm(BLANK_BUD); setBudgetModal(true); };
  const openEditBudget  = (cat, limit) => { setBudForm({ category:cat, limit:String(limit) }); setBudgetModal(true); };

  // const handleSaveBudget = () => {
  //   const { category, limit } = budForm;
  //   if (!category || !limit || isNaN(parseFloat(limit)) || parseFloat(limit) <= 0) {
  //     showToast("⚠️ Select a category and enter a valid limit"); return;
  //   }
  //   setBudgets(prev => ({ ...prev, [category]: parseFloat(limit) }));
  //   setBudgetModal(false);
  //   showToast("✅ Budget saved");
  // };

  const handleSaveBudget = async () => {
    const { category, limit } = budForm;

    if (!category || !limit || isNaN(limit) || limit <= 0) {
      showToast("⚠️ Enter valid data");
      return;
    }

    try {
      await fetch(`${BASE_URL}/category-budget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          amount: parseFloat(limit)
        })
      });

      await loadCategoryBudgets();

      setBudgetModal(false);
      showToast("✅ Budget saved");
    } catch {
      showToast("❌ Failed to save budget");
    }
  };

  // const handleDeleteBudget = (cat) => {
  //   setBudgets(prev => { const n = {...prev}; delete n[cat]; return n; });
  //   setBudgetModal(false);
  //   showToast("🗑️ Budget removed");
  // };

  const handleDeleteBudget = async (cat) => {
    try {
      await fetch(`${BASE_URL}/category-budget/${cat}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      await loadCategoryBudgets();

      setBudgetModal(false);
      showToast("🗑️ Budget removed");
    } catch {
      showToast("❌ Failed to delete");
    }
  };


  const loadCategoryBudgets = async () => {
    try {
      const res = await fetch(`${BASE_URL}/category-budget`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      const map = {};
      data.forEach(b => map[b.category] = Number(b.amount));

      setBudgets(map);
    } catch {
      showToast("❌ Failed to load budgets");
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  // const now = new Date();
  
  // const thisMonth = expenses.filter(e => {
  //   const d = new Date(e.date);
  //   return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  // });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7); // "2026-03"
  });

  const selectedDate = new Date(selectedMonth);

  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear();
  });
  const totalExpenses = thisMonth.reduce((s,e) => s + Number(e.amount), 0);
  // const totalIncome   = 85000;
  // const totalIncome = income;
  // const currentKey = now.toISOString().slice(0, 7);
  const currentKey = selectedMonth;
  const totalIncome = incomeByMonth[currentKey] || 0;
  const netSavings    = totalIncome - totalExpenses;
  // const budgetLimit   = 40000;
  const budgetLimit = monthlyBudget[currentKey] || 0;
  // const budgetPct     = Math.min(100, Math.round((totalExpenses / budgetLimit) * 100));
  const budgetPct = budgetLimit
  ? Math.round((totalExpenses / budgetLimit) * 100)
  : 0;
  // const avgPerDay     = now.getDate() ? Math.round(totalExpenses / now.getDate()) : 0;
  // const avgPerDay = selectedDate.getDate()
  //   ? Math.round(totalExpenses / selectedDate.getDate())
  //   : 0;
  const currentDate = new Date();

  const isCurrentMonth =
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getFullYear() === currentDate.getFullYear();

  const daysCount = isCurrentMonth
    ? currentDate.getDate()
    : new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0
      ).getDate();

  const avgPerDay = daysCount   
    ? Math.round(totalExpenses / daysCount)
    : 0;

  const catMap = {};
  thisMonth.forEach(e => { const c = e.category||"Other"; catMap[c] = (catMap[c]||0) + Number(e.amount); });
  const catData    = Object.entries(catMap).sort((a,b) => b[1]-a[1]).map(([label,value]) => ({ label, value }));
  const budgetRows = Object.entries(budgets).map(([cat,limit]) => ({
    cat, limit, spent: catMap[cat]||0,
    pct: Math.min(100, Math.round(((catMap[cat]||0)/limit)*100)),
    cls: (catMap[cat]||0)/limit > 1 ? "over" : (catMap[cat]||0)/limit > 0.8 ? "warn" : "safe",
  }));

  // const sorted     = [...expenses].sort((a,b) => new Date(b.date) - new Date(a.date));
  const sorted = [...thisMonth].sort((a,b) => Number(b.amount) - Number(a.amount));
  // const monthLabel = now.toLocaleString("default", { month:"long", year:"numeric" });
  const monthLabel = selectedDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });
  const catSpent   = expForm.category ? (catMap[expForm.category]||0) : null;
  const catBudget  = expForm.category ? (budgets[expForm.category]||null) : null;

  const [incomeMonth, setIncomeMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // "2026-03"
  });


  const loadIncome = async () => {
    try {
      const res = await fetch(`${BASE_URL}/income`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      const map = {};
      data.forEach(i => map[i.month] = Number(i.amount));

      setIncomeByMonth(map);
    } catch {
      showToast("❌ Failed to load income");
    }
  };

  const loadMonthlyBudget = async () => {
    try {
      const res = await fetch(`${BASE_URL}/monthly-budget`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      const map = {};
      data.forEach(b => map[b.month] = Number(b.amount));

      setMonthlyBudget(map);
    } catch {
      showToast("❌ Failed to load monthly budget");
    }
  };

  useEffect(() => {
    if (!incomeMonth) return;

    const existingIncome = incomeByMonth[incomeMonth] || "";
    setIncomeInput(existingIncome);
  }, [incomeMonth, incomeByMonth]);
 
  useEffect(() => {
    if (!token) return;

    loadCategoryBudgets();
    loadIncome();
    loadMonthlyBudget();
  }, [token]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
    }
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className="st-root">

        {/* ── Topbar ── */}
        <div className="st-topbar">
          <div className="st-logo">Split<span>Track</span></div>
          <div className="st-nav">
            <button className={`st-nav-btn${activeTab==="personal"?" active":""}`} onClick={() => setActiveTab("personal")}>Personal</button>
            <button className={`st-nav-btn${activeTab==="groups"?"   active":""}`} onClick={() => setActiveTab("groups")}>Groups</button>
          </div>
          <div className="st-topbar-right">
            {/* <div className="st-month-badge">{monthLabel}</div> */}

            <select
              className="st-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: "160px", fontSize: "13px", padding: "6px 10px" }}
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const value = d.toISOString().slice(0, 7);

                return (
                  <option key={value} value={value}>
                    {d.toLocaleString("default", { month: "long", year: "numeric" })}
                  </option>
                );
              })}
            </select>
            {/* ── Profile icon + dropdown ── */}
            {/* <ProfileDropdown onLogout={handleLogout} /> */}
            <ProfileDropdown 
              onLogout={handleLogout}
              onAddIncome={() => {
                const key = new Date().toISOString().slice(0, 7);
                  setIncomeMonth(key);
                  setIncomeInput(incomeByMonth[key] || "");
                  setIncomeModal(true);
              }}
              onSetMonthlyBudget={() => {
                const key = new Date().toISOString().slice(0, 7);
                setMonthlyBudgetInput(monthlyBudget[key] || "");
                setMonthlyBudgetModal(true);
              }}
            />
          </div>
        </div>

        {/* ── PERSONAL VIEW ── */}
        {activeTab === "personal" && (
          <div className="st-page">

            {/* Metrics */}
            <div className="st-metrics st-metrics-4">
              {[
                { label:"Total Income",   val:fmtINR(totalIncome),   cls:"green",   sub:monthLabel },
                { label:"Total Expenses", val:fmtINR(totalExpenses), cls:"red",     sub:`${thisMonth.length} transactions` },
                // { label:"Net Savings",    val:fmtINR(netSavings),    cls:"green",   sub:`${totalIncome?Math.round(netSavings/totalIncome*100):0}% savings rate` },
                { 
                  label:"Net Savings",    
                  val:fmtINR(netSavings),    
                  cls: netSavings > 0 ? "green" : netSavings < 0 ? "red" : "neutral"
                },
                { 
                  label:"Budget Used",    val:budgetLimit ? `${budgetPct}%` : "—",  
                  cls:"neutral", sub: budgetLimit
                  ? `${fmtINR(totalExpenses)} of ${fmtINR(budgetLimit)}`
                  : "No budget set" 
                },
              ].map((m, i) => (
                <div className="st-metric-card" key={m.label} style={{ animationDelay:`${i*60}ms` }}>
                  <div className="st-metric-label">{m.label}</div>
                  <div className={`st-metric-val ${m.cls}`}>{m.val}</div>
                  {m.label === "Budget Used" ? (
                    <>
                      <div className="st-budget-track">
                        <div className={`st-budget-fill ${budgetPct>100?"over":budgetPct>80?"warn":"safe"}`} style={{ width: `${Math.min(100, budgetPct)}%` }}/>
                      </div>
                      <div className="st-metric-sub" style={{ marginTop:4 }}>{m.sub}</div>
                    </>
                  ) : <div className="st-metric-sub">{m.sub}</div>}
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="st-two-col st-two-col-5050" style={{ marginBottom:20 }}>
              <div className="st-card" style={{ animationDelay:"200ms" }}>
                <div className="st-card-header">
                  <div className="st-card-title">Spending by Category</div>
                  <div className="st-card-subtitle">{monthLabel}</div>
                </div>
                <div className="st-card-body" style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                  {catData.length > 0 ? (
                    <>
                      <div style={{ flexShrink:0 }}><DonutChart data={catData}/></div>
                      <div style={{ flex:1, minWidth:120 }}>
                        {catData.map((d,i) => (
                          <div className="st-legend-row" key={d.label}>
                            <div className="st-legend-dot" style={{ background:CAT_COLORS[i%CAT_COLORS.length] }}/>
                            <span style={{ color:"var(--muted)", fontSize:11, flex:1 }}>{d.label}</span>
                            <span style={{ fontWeight:700, fontFamily:"DM Mono", fontSize:11 }}>{fmtINR(d.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="st-empty"><div className="st-empty-icon">📊</div><p>No data this month</p></div>
                  )}
                </div>
              </div>

              <div className="st-card" style={{ animationDelay:"240ms" }}>
                <div className="st-card-header">
                  <div className="st-card-title">This Month at a Glance</div>
                  <div className="st-card-subtitle">{monthLabel}</div>
                </div>
                <div className="st-card-body">
                  {[
                    { label:"Avg / day",       val:fmtINR(avgPerDay),                              icon:"📅" },
                    { label:"Transactions",    val:thisMonth.length,                               icon:"🧾" },
                    { label:"Categories used", val:catData.length,                                 icon:"🏷️" },
                    { label:"Largest expense", val:sorted[0] ? fmtINR(sorted[0].amount) : "—",    icon:"📌" },
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
                      <div style={{ width:34, height:34, borderRadius:9, background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{r.icon}</div>
                      <div style={{ flex:1, fontSize:13, color:"var(--muted)" }}>{r.label}</div>
                      <div style={{ fontWeight:700, fontFamily:"DM Mono", fontSize:14 }}>{r.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget + Transactions */}
            <div className="st-two-col st-two-col-5050">
              <div className="st-card" style={{ animationDelay:"280ms" }}>
                <div className="st-card-header">
                  <div className="st-card-title">Budget Tracker</div>
                  <button className="st-btn-primary" onClick={openAddBudget} style={{ padding:"6px 13px", fontSize:12 }}>+ Set Budget</button>
                </div>
                <div className="st-card-body">
                  {budgetRows.length === 0 ? (
                    <div className="st-empty"><div className="st-empty-icon">💰</div><p>No budgets set yet.</p></div>
                  ) : budgetRows.map(b => (
                    <div className="st-budget-row" key={b.cat}>
                      <div className="st-budget-top">
                        <div className="st-budget-name"><span>{CAT_ICONS[b.cat]||"💳"}</span><span>{b.cat}</span></div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span className="st-budget-nums">{fmtINR(b.spent)} / {fmtINR(b.limit)}</span>
                          <button className="st-icon-btn edit st-budget-edit" onClick={() => openEditBudget(b.cat, b.limit)}>✏️</button>
                        </div>
                      </div>
                      <div className="st-budget-track"><div className={`st-budget-fill ${b.cls}`} style={{ width:`${b.pct}%` }}/></div>
                      {b.cls === "over" && <div style={{ fontSize:11, color:"var(--red)", marginTop:4, fontWeight:600 }}>Over by {fmtINR(b.spent-b.limit)}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="st-card" style={{ animationDelay:"320ms" }}>
                <div className="st-card-header">
                  <div className="st-card-title">Transactions</div>
                  <button className="st-btn-primary" onClick={openAddExpense} style={{ padding:"6px 13px", fontSize:12 }}>+ Add Expense</button>
                </div>
                <div className="st-card-body">
                  {loading ? (
                    <div className="st-empty"><div className="st-spinner dark" style={{ width:24, height:24 }}/></div>
                  ) : sorted.length === 0 ? (
                    <div className="st-empty"><div className="st-empty-icon">📭</div><p>No expenses yet.<br/>Click + Add Expense to begin.</p></div>
                  ) : (
                    <div style={{ maxHeight:360, overflowY:"auto", paddingRight:2 }}>
                      {sorted.map((exp, idx) => (
                        <div className="st-txn-row" key={exp.id} style={{ animationDelay:`${idx*25}ms` }}>
                          <div className="st-txn-icon">{CAT_ICONS[exp.category]||"💳"}</div>
                          <div className="st-txn-info">
                            <div className="st-txn-name">{exp.description}</div>
                            <div className="st-txn-meta">
                              {exp.category||"Other"}
                              <span className="st-tag">{new Date(exp.date+"T00:00:00").toLocaleDateString("en-IN",{ day:"numeric", month:"short" })}</span>
                            </div>
                          </div>
                          <div className="st-txn-amt neg">−{fmtINR(exp.amount)}</div>
                          <div className="st-txn-actions">
                            <button className="st-icon-btn edit" onClick={() => openEditExpense(exp)}>✏️</button>
                            <button className="st-icon-btn del"  onClick={() => handleDelete(exp.id)}>🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── GROUPS VIEW ── */}
        {activeTab === "groups" && (
          <div className="st-page">
            <div className="st-card">
              <div className="st-groups-coming">
                <div className="g-icon">👥</div>
                <h3>Groups coming soon</h3>
                <p style={{ marginTop:6 }}>Group expenses, split types, balances &amp; settlements are being built.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══ MODAL — Add / Edit Expense ══ */}
        <Modal
          open={expModal}
          onClose={() => !saving && setExpModal(false)}
          title={expForm.id ? "Edit Expense" : "Add New Expense"}
          footer={
            <>
              <button className="st-btn-secondary" onClick={() => setExpModal(false)} disabled={saving}>Cancel</button>
              {expForm.id && <button className="st-btn-danger" onClick={() => { setExpModal(false); handleDelete(expForm.id); }} disabled={saving}>Delete</button>}
              <button className="st-btn-primary" onClick={handleSaveExpense} disabled={saving}>
                {saving ? <><div className="st-spinner"/> Saving…</> : expForm.id ? "Update Expense" : "Add Expense"}
              </button>
            </>
          }
        >
          <div className="st-field">
            <label className="st-label">Description *</label>
            <input className="st-input" placeholder="e.g. Swiggy lunch" autoFocus
              value={expForm.description}
              onChange={e => setExpForm(p => ({ ...p, description:e.target.value }))}
            />
          </div>
          <div className="st-field-row">
            <div className="st-field">
              <label className="st-label">Amount (₹) *</label>
              <input className="st-input" type="number" placeholder="0.00" inputMode="decimal"
                value={expForm.amount}
                onChange={e => setExpForm(p => ({ ...p, amount:e.target.value }))}
              />
            </div>
            <div className="st-field">
              <label className="st-label">Date *</label>
              <input className="st-input" type="date"
                value={expForm.date}
                onChange={e => setExpForm(p => ({ ...p, date:e.target.value }))}
              />
            </div>
          </div>
          <div className="st-field">
            <label className="st-label">Category</label>
            <select className="st-select" value={expForm.category}
              onChange={e => setExpForm(p => ({ ...p, category:e.target.value }))}>
              <option value="">— Select category —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {catBudget && expForm.category && (
            <div className="st-modal-budget-preview">
              <div className="label">Budget for {expForm.category}</div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:7 }}>
                <span style={{ color:"var(--muted)" }}>Spent so far</span>
                <span style={{ fontWeight:700, fontFamily:"DM Mono" }}>{fmtINR(catSpent)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:8 }}>
                <span style={{ color:"var(--muted)" }}>Budget limit</span>
                <span style={{ fontWeight:700, fontFamily:"DM Mono" }}>{fmtINR(catBudget)}</span>
              </div>
              <div className="st-budget-track">
                <div className={`st-budget-fill ${catSpent/catBudget>1?"over":catSpent/catBudget>0.8?"warn":"safe"}`}
                  style={{ width:`${Math.min(100,Math.round(catSpent/catBudget*100))}%` }}/>
              </div>
              {catSpent > catBudget && (
                <div style={{ fontSize:11, color:"var(--red)", marginTop:5, fontWeight:600 }}>
                  ⚠️ Already over budget by {fmtINR(catSpent-catBudget)}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* ══ MODAL — Add / Edit Budget ══ */}
        <Modal
          open={budgetModal}
          onClose={() => setBudgetModal(false)}
          title={budForm.category && budgets[budForm.category] ? "Edit Budget" : "Set Category Budget"}
          footer={
            <>
              <button className="st-btn-secondary" onClick={() => setBudgetModal(false)}>Cancel</button>
              {budForm.category && budgets[budForm.category] && (
                <button className="st-btn-danger" onClick={() => handleDeleteBudget(budForm.category)}>Remove</button>
              )}
              <button className="st-btn-primary" onClick={handleSaveBudget}>
                {budForm.category && budgets[budForm.category] ? "Update Budget" : "Set Budget"}
              </button>
            </>
          }
        >
          <div className="st-field">
            <label className="st-label">Category *</label>
            <select className="st-select" value={budForm.category}
              onChange={e => setBudForm(p => ({ ...p, category:e.target.value, limit:budgets[e.target.value]?String(budgets[e.target.value]):p.limit }))}>
              <option value="">— Select category —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]||"💳"} {c}</option>)}
            </select>
          </div>
          <div className="st-field">
            <label className="st-label">Monthly Limit (₹) *</label>
            <input className="st-input" type="number" placeholder="e.g. 5000" inputMode="numeric"
              value={budForm.limit}
              onChange={e => setBudForm(p => ({ ...p, limit:e.target.value }))}
            />
          </div>
          {budForm.category && budForm.limit && parseFloat(budForm.limit) > 0 && (
            <div className="st-modal-budget-preview">
              <div className="label">Preview</div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:7 }}>
                <span style={{ color:"var(--muted)" }}>Spent this month</span>
                <span style={{ fontWeight:700, fontFamily:"DM Mono" }}>{fmtINR(catMap[budForm.category]||0)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:8 }}>
                <span style={{ color:"var(--muted)" }}>New limit</span>
                <span style={{ fontWeight:700, fontFamily:"DM Mono" }}>{fmtINR(parseFloat(budForm.limit))}</span>
              </div>
              {(() => {
                const sp=catMap[budForm.category]||0, lim=parseFloat(budForm.limit)||1;
                const p=Math.min(100,Math.round(sp/lim*100)), cls=sp/lim>1?"over":sp/lim>0.8?"warn":"safe";
                return <>
                  <div className="st-budget-track"><div className={`st-budget-fill ${cls}`} style={{ width:`${p}%` }}/></div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:5 }}>{p}% used</div>
                </>;
              })()}
            </div>
          )}
        </Modal>

        <Modal
          open={incomeModal}
          onClose={() => setIncomeModal(false)}
          title="Update Monthly Income"
          footer={
            <>
              <button className="st-btn-secondary" onClick={() => setIncomeModal(false)}>
                Cancel
              </button>
              <button
                className="st-btn-primary"
                // onClick={() => {
                //   if (!incomeInput || isNaN(incomeInput)) return;
                //   setIncome(parseFloat(incomeInput));
                //   setIncomeModal(false);
                //   setIncomeInput("");
                //   showToast("✅ Income updated");
                // }}
                onClick={async () => {
                  const val = parseFloat(incomeInput);

                  if (!val || val <= 0) {
                    showToast("⚠️ Enter valid income");
                    return;
                  }

                  try {
                    await fetch(`${BASE_URL}/income`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        month: incomeMonth,
                        amount: val
                      })
                    });

                    await loadIncome();

                    setIncomeModal(false);
                    showToast("✅ Income saved");
                  } catch {
                    showToast("❌ Failed to save income");
                  }
                }}
              >
                Save Income
              </button>
            </>
          }
        >
          <div className="st-field">
            <label className="st-label">Month</label>
            <input
              type="month"
              className="st-input"
              value={incomeMonth}
              onChange={(e) => setIncomeMonth(e.target.value)}
            />
          </div>

          <div className="st-field">
            <label className="st-label">Income (₹)</label>
            <input
              className="st-input"
              type="number"
              placeholder="Enter income"
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
            />
          </div>
        </Modal>

        <Modal
          open={monthlyBudgetModal}
          onClose={() => setMonthlyBudgetModal(false)}
          // title="Set Monthly Budget"
          title={`Budget for ${new Date().toLocaleString("default", {
            month: "long",
            year: "numeric"
          })}`} 
          footer={
            <>
              <button className="st-btn-secondary" onClick={() => setMonthlyBudgetModal(false)}>
                Cancel
              </button>
              <button
                className="st-btn-primary"
                // onClick={() => {
                //   const val = parseFloat(monthlyBudgetInput);

                //   if (!val || val <= 0) {
                //     showToast("⚠️ Enter valid budget");
                //     return;
                //   }

                //   setMonthlyBudget(prev => ({
                //     ...prev,
                //     [currentKey]: val
                //   }));

                //   setMonthlyBudgetModal(false);
                //   showToast("✅ Monthly budget saved");
                // }}
                onClick={async () => {
                  const val = parseFloat(monthlyBudgetInput);

                  if (!val || val <= 0) {
                    showToast("⚠️ Enter valid budget");
                    return;
                  }

                  try {
                    await fetch(`${BASE_URL}/monthly-budget`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        month: currentKey,
                        amount: val
                      })
                    });

                    await loadMonthlyBudget();

                    setMonthlyBudgetModal(false);
                    showToast("✅ Monthly budget saved");
                  } catch {
                    showToast("❌ Failed to save budget");
                  }
                }}
              >
                Save
              </button>
            </>
          }
        >
          <div className="st-field">
            <label className="st-label">Month</label>
            <input
              className="st-input"
              value={new Date().toLocaleString("default", {
                month: "long",
                year: "numeric"
              })}
              disabled
            />
          </div>
          <div className="st-field">
            <label className="st-label">Monthly Budget (₹)</label>
            <input
              className="st-input"
              type="number"
              value={monthlyBudgetInput}
              onChange={(e) => setMonthlyBudgetInput(e.target.value)}
            />
          </div>
        </Modal>

        <div className={`st-toast${toastOn?" show":""}`}>{toastMsg}</div>
      </div>
    </>
  );
};

export default HomePage;