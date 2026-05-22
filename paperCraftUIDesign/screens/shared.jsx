// shared.jsx — PaperCraft chrome (sidebar, topbar) + icon set + tiny utils
// Globals are window-exposed at the bottom for cross-file access.

const Icon = ({ name, size = 16, stroke = 1.6, style }) => {
  const s = { width: size, height: size, ...style };
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round", style: s };
  const paths = {
    home: <><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/></>,
    book: <><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M4 17h15"/></>,
    layers: <><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17l9 5 9-5"/></>,
    edit: <><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    archive: <><path d="M3 7h18v4H3z"/><path d="M5 11v9h14v-9"/><path d="M10 15h4"/></>,
    bars: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/></>,
    chart: <><path d="M3 3v18h18"/><rect x="7" y="13" width="3" height="5"/><rect x="12" y="9" width="3" height="9"/><rect x="17" y="5" width="3" height="13"/></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    chev: <><polyline points="9 18 15 12 9 6"/></>,
    chevDown: <><polyline points="6 9 12 15 18 9"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    minus: <><line x1="5" y1="12" x2="19" y2="12"/></>,
    sparkles: <><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    folder: <><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="0.5"/><circle cx="4" cy="12" r="0.5"/><circle cx="4" cy="18" r="0.5"/></>,
    dots: <><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    users: <><circle cx="9" cy="8" r="4"/><circle cx="17" cy="9" r="3"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M14.5 14a5.5 5.5 0 0 1 7.5 7"/></>,
    setting: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z"/></>,
    flame: <><path d="M12 2s4 5 4 9a4 4 0 0 1-8 0c0-1.5 1-3 1-3s-1 5 3 5"/><path d="M12 22a7 7 0 0 0 7-7c0-3-2-6-7-12-5 6-7 9-7 12a7 7 0 0 0 7 7z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></>,
    paperclip: <><path d="M21 11l-9.5 9.5a5.5 5.5 0 0 1-7.8-7.8l9.6-9.6a3.5 3.5 0 1 1 5 5l-9.6 9.6a1.5 1.5 0 0 1-2.1-2.1l8.5-8.5"/></>,
    eye: <><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    flag: <><path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/></>,
    sliders: <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.5 9a9 9 0 0 1 15-3.4l4.5 4.4"/><path d="M20.5 15a9 9 0 0 1-15 3.4L1 14"/></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    drag: <><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></>,
    info: <><circle cx="12" cy="12" r="9"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    warn: <><path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    star: <><polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9 12 2"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    bold: <><path d="M6 4h7a4 4 0 0 1 0 8H6z"/><path d="M6 12h8a4 4 0 0 1 0 8H6z"/></>,
    italic: <><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></>,
    code: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
    pi: <><line x1="3" y1="7" x2="21" y2="7"/><line x1="8" y1="7" x2="8" y2="20"/><path d="M16 7v10a2 2 0 0 0 4 0"/></>,
    note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></>,
    palette: <><circle cx="12" cy="12" r="9"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1.2" fill="currentColor"/><path d="M12 21a3 3 0 0 1-3-3c0-1.5 1-2 1-3.5S9 12 12 12"/></>,
    play: <><polygon points="6 4 20 12 6 20 6 4"/></>,
    expand: <><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>,
    msg: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/><polyline points="12 7 12 12 16 14"/></>,
  };
  return <svg {...props}>{paths[name] || null}</svg>;
};

// === Brand mark ===
const Brand = ({ subtitle }) => (
  <div className="pc-brand">
    <div className="pc-brand-mark" />
    <div style={{ lineHeight: 1.05 }}>
      <div className="pc-brand-name">Paper<em>Craft</em></div>
      {subtitle && <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2 }}>{subtitle}</div>}
    </div>
  </div>
);

// === Sidebar ===
// items: [{section, items: [{key, label, icon, badge}]}]
const Sidebar = ({ role = "admin", session = "2025–26 · Term II", session2 = "Half-Yearly", active, items, footName, footRole, footAvatar = "AK", footAvatarClass = "is-blue" }) => (
  <aside className="pc-sidebar">
    <Brand subtitle={role === "admin" ? "Admin Workspace" : "Teacher Workspace"} />
    <div className="pc-session-pill">
      <span className="pc-session-pill-dot" />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <span className="pc-session-pill-label">Session</span>
        <span className="pc-session-pill-value">{session}</span>
      </div>
      <span className="pc-session-pill-chev"><Icon name="chevDown" size={14} /></span>
    </div>
    <nav className="pc-nav">
      {items.map((g, i) => (
        <div className="pc-nav-group" key={i}>
          {g.section && <div className="pc-nav-label">{g.section}</div>}
          {g.items.map(it => (
            <div key={it.key} className={"pc-nav-item" + (active === it.key ? " is-active" : "")}>
              <Icon name={it.icon} size={15} />
              <span>{it.label}</span>
              {it.badge && <span className="pc-nav-item-badge">{it.badge}</span>}
            </div>
          ))}
        </div>
      ))}
    </nav>
    <div className="pc-sidebar-foot">
      <div className={"pc-avatar " + footAvatarClass}>{footAvatar}</div>
      <div style={{ lineHeight: 1.2 }}>
        <div className="pc-foot-name">{footName}</div>
        <div className="pc-foot-role">{footRole}</div>
      </div>
      <div style={{ marginLeft: "auto", color: "var(--pc-ink-4)" }}>
        <Icon name="setting" size={14} />
      </div>
    </div>
  </aside>
);

// === Topbar ===
const Topbar = ({ crumbs, actions, notify = true }) => (
  <header className="pc-topbar">
    <div className="pc-crumbs">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="pc-crumbs-sep"><Icon name="chev" size={12} /></span>}
          {i === crumbs.length - 1 ? <strong>{c}</strong> : <span>{c}</span>}
        </React.Fragment>
      ))}
    </div>
    <div className="pc-cmd">
      <Icon name="search" size={14} />
      <span>Search questions, chapters, papers…</span>
      <kbd>⌘K</kbd>
    </div>
    <button className="pc-icon-btn" title="Notifications">
      <Icon name="bell" size={15} />
      {notify && <span className="pc-icon-btn-dot" />}
    </button>
    {actions}
  </header>
);

// Sidebar items (presets)
const ADMIN_NAV = [
  { section: null, items: [
    { key: "home", label: "Control Center", icon: "home" },
    { key: "feed", label: "Activity Feed", icon: "history", badge: "12" },
  ]},
  { section: "Academic", items: [
    { key: "repo", label: "Question Repository", icon: "archive", badge: "3.4k" },
    { key: "curriculum", label: "Curriculum", icon: "layers" },
    { key: "blueprint", label: "Blueprints", icon: "target" },
  ]},
  { section: "Papers", items: [
    { key: "papers", label: "Paper Library", icon: "file" },
    { key: "builder", label: "Paper Builder", icon: "edit" },
    { key: "approval", label: "Approvals", icon: "check", badge: "7" },
  ]},
  { section: "Organization", items: [
    { key: "teachers", label: "Teachers", icon: "users" },
    { key: "analytics", label: "Analytics", icon: "chart" },
  ]},
];

const TEACHER_NAV = [
  { section: null, items: [
    { key: "home", label: "My Workspace", icon: "home" },
    { key: "drafts", label: "Drafts", icon: "edit", badge: "3" },
  ]},
  { section: "Compose", items: [
    { key: "gen", label: "Generate Paper", icon: "sparkles" },
    { key: "builder", label: "Paper Builder", icon: "file" },
    { key: "library", label: "My Papers", icon: "archive" },
  ]},
  { section: "Browse", items: [
    { key: "repo", label: "Question Bank", icon: "book" },
    { key: "blueprint", label: "Blueprints", icon: "target" },
  ]},
];

// Tiny utilities

const Stat = ({ label, value, unit, hint, trend }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>{label}</span>
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span className="pc-serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.025em" }}>{value}</span>
      {unit && <span style={{ fontSize: 12, color: "var(--pc-ink-4)" }}>{unit}</span>}
    </div>
    {hint && <span style={{ fontSize: 11.5, color: "var(--pc-ink-3)" }}>{hint}</span>}
    {trend}
  </div>
);

// Tiny sparkline
const Spark = ({ points = [4, 6, 5, 8, 7, 10, 9, 12, 11, 14], color = "var(--pc-primary)", height = 28 }) => {
  const w = 100, h = height;
  const max = Math.max(...points), min = Math.min(...points);
  const step = w / (points.length - 1);
  const norm = points.map((p, i) => `${i * step},${h - ((p - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  return (
    <svg className="pc-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={norm} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Difficulty pips: 1=easy, 2=med, 3=hard, 4=very hard
const Difficulty = ({ level }) => {
  const tone = ["is-easy", "is-easy", "is-medium", "is-hard"][level - 1] || "is-medium";
  return (
    <span className="pc-pips" title={["Easy","Easy","Medium","Hard"][level - 1] || "Medium"}>
      {[1,2,3,4].map(i => <span key={i} className={"pc-pip " + (i <= level ? tone : "")} />)}
    </span>
  );
};

Object.assign(window, { Icon, Brand, Sidebar, Topbar, ADMIN_NAV, TEACHER_NAV, Stat, Spark, Difficulty });
