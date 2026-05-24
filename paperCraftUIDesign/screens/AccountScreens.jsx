// AccountScreens.jsx — Profile, Workspace, Teachers, Notifications, Preferences, Security

// ───────── primitives ─────────
const Card = ({ title, subtitle, action, children, padded = true }) => (
  <section style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12, boxShadow: "var(--pc-shadow-xs)", overflow: "hidden" }}>
    {(title || action) && (
      <header style={{ padding: "14px 18px", borderBottom: "1px solid var(--pc-line)", display: "flex", alignItems: "center", gap: 10, background: "var(--pc-surface)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && <div className="pc-serif" style={{ fontSize: 14.5, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--pc-ink)" }}>{title}</div>}
          {subtitle && <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
      </header>
    )}
    <div style={{ padding: padded ? "16px 18px" : 0 }}>{children}</div>
  </section>
);

const Row = ({ label, hint, children, action }) => (
  <div style={{ display: "grid", gridTemplateColumns: "200px 1fr auto", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--pc-line)", alignItems: "center" }}>
    <div>
      <div style={{ fontSize: 12.5, color: "var(--pc-ink)", fontWeight: 500 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginTop: 2, lineHeight: 1.45 }}>{hint}</div>}
    </div>
    <div>{children}</div>
    <div>{action}</div>
  </div>
);

const Inp = ({ value, placeholder, mono = false, w }) => (
  <input defaultValue={value} placeholder={placeholder} style={{
    height: 32, padding: "0 11px", borderRadius: 7, border: "1px solid var(--pc-line)",
    background: "var(--pc-surface-2)", fontSize: 12.5, color: "var(--pc-ink)", outline: "none",
    fontFamily: mono ? "var(--pc-mono)" : "var(--pc-sans)", width: w || "100%",
    boxShadow: "var(--pc-shadow-xs)",
  }} />
);

const Sel = ({ value, w }) => (
  <select defaultValue={value} style={{
    height: 32, padding: "0 28px 0 11px", borderRadius: 7, border: "1px solid var(--pc-line)",
    background: "var(--pc-surface-2)", fontSize: 12.5, color: "var(--pc-ink)", outline: "none",
    fontFamily: "var(--pc-sans)", width: w || "100%", boxShadow: "var(--pc-shadow-xs)",
    appearance: "none", backgroundImage: "linear-gradient(45deg,transparent 50%,#7a7d86 50%),linear-gradient(135deg,#7a7d86 50%,transparent 50%)",
    backgroundPosition: "calc(100% - 14px) 14px,calc(100% - 9px) 14px", backgroundSize: "5px 5px,5px 5px", backgroundRepeat: "no-repeat",
  }}><option>{value}</option></select>
);

const Switch = ({ on = false }) => (
  <span style={{
    display: "inline-block", width: 34, height: 20, borderRadius: 999,
    background: on ? "var(--pc-primary)" : "#D3D5DB", position: "relative", cursor: "pointer",
    transition: "background 0.15s", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
  }}>
    <span style={{
      position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: 999,
      background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04)",
      transition: "left 0.15s",
    }} />
  </span>
);

const Chk = ({ on = false, label }) => (
  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--pc-ink-2)", cursor: "pointer" }}>
    <span style={{ width: 16, height: 16, borderRadius: 4, border: "1px solid " + (on ? "var(--pc-primary)" : "var(--pc-line-2)"), background: on ? "var(--pc-primary)" : "var(--pc-surface)", display: "grid", placeItems: "center", boxShadow: "var(--pc-shadow-xs)" }}>
      {on && <Icon name="check" size={10} stroke={3} style={{ color: "white" }} />}
    </span>{label}
  </label>
);

const Seg = ({ options, active = 0, dense = true }) => (
  <div style={{ display: "inline-flex", background: "var(--pc-surface-3)", borderRadius: 7, padding: 3, border: "1px solid var(--pc-line)" }}>
    {options.map((o, i) => (
      <button key={i} style={{
        height: dense ? 26 : 30, padding: "0 12px", border: 0, borderRadius: 5,
        background: i === active ? "var(--pc-surface)" : "transparent",
        color: i === active ? "var(--pc-ink)" : "var(--pc-ink-4)",
        fontSize: 11.5, fontWeight: 500, fontFamily: "var(--pc-sans)", cursor: "pointer",
        boxShadow: i === active ? "var(--pc-shadow-xs)" : "none",
      }}>{o}</button>
    ))}
  </div>
);

const Tag = ({ children, tone = "" }) => <span className={"pc-tag " + tone} style={{ height: 19, fontSize: 10.5 }}>{children}</span>;

// Settings page tab rail (left, 220px)
const AcctTabs = ({ active }) => {
  const tabs = [
    { k: "profile",  label: "My Profile",        icon: "user" },
    { k: "school",   label: "School / Workspace", icon: "home" },
    { k: "teachers", label: "Teachers",           icon: "users" },
    { k: "notify",   label: "Notifications",      icon: "bell" },
    { k: "prefs",    label: "Preferences",        icon: "palette" },
    { k: "security", label: "Security",           icon: "lock" },
  ];
  return (
    <aside style={{ width: 224, borderRight: "1px solid var(--pc-line)", padding: "20px 14px", background: "var(--pc-surface-2)", flexShrink: 0 }}>
      <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500, padding: "0 8px 10px" }}>Settings</div>
      {tabs.map(t => {
        const on = active === t.k;
        return (
          <div key={t.k} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 2,
            background: on ? "var(--pc-surface)" : "transparent",
            border: "1px solid " + (on ? "var(--pc-line)" : "transparent"),
            boxShadow: on ? "var(--pc-shadow-xs)" : "none",
            color: on ? "var(--pc-ink)" : "var(--pc-ink-3)",
          }}>
            <Icon name={t.icon} size={14} style={{ color: on ? "var(--pc-primary)" : "var(--pc-ink-4)" }} />
            <span style={{ fontSize: 12.5, fontWeight: on ? 500 : 400 }}>{t.label}</span>
            {on && <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: 4, background: "var(--pc-primary)" }} />}
          </div>
        );
      })}
      <div style={{ marginTop: 18, padding: "0 8px 10px", fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500 }}>Workspace</div>
      <div style={{ padding: "0 10px", fontSize: 11.5, color: "var(--pc-ink-3)", lineHeight: 1.55 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 600, color: "var(--pc-ink)" }}>SV</span>
          <span style={{ fontWeight: 500, color: "var(--pc-ink-2)" }}>Saraswati Vidya Niketan</span>
        </div>
        <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", marginTop: 4 }}>Lucknow · Plan: Institution</div>
      </div>
    </aside>
  );
};

const AcctShell = ({ active, title, subtitle, action, children }) => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="settings" items={ADMIN_NAV}
        footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar crumbs={["Settings", title]} actions={action || <button className="pc-btn"><Icon name="user" size={13} />Account</button>} />
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <AcctTabs active={active} />
          <main className="pc-scroll" style={{ flex: 1, overflow: "auto", padding: "26px 32px 40px", background: "var(--pc-bg)" }}>
            <div style={{ maxWidth: 880, margin: "0 auto" }}>
              <div style={{ marginBottom: 22 }}>
                <h1 className="pc-serif" style={{ fontSize: 28, fontWeight: 500, margin: 0, letterSpacing: "-0.025em", color: "var(--pc-ink)" }}>{title}</h1>
                {subtitle && <p style={{ fontSize: 13, color: "var(--pc-ink-3)", margin: "6px 0 0", lineHeight: 1.5, maxWidth: 620 }}>{subtitle}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="pc-btn">Discard changes</button>
                <button className="pc-btn is-primary">Save changes</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
);

// ═════════════ ① MY PROFILE ═════════════
const ScreenProfile = () => (
  <AcctShell active="profile" title="My Profile" subtitle="Your identity across PaperCraft. This is how teachers and approvers see you in approvals, comments and the activity feed.">
    <Card title="Identity" subtitle="Your basic profile — visible to your school workspace.">
      <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 14, borderBottom: "1px solid var(--pc-line)" }}>
        <div style={{ width: 80, height: 80, borderRadius: 999, background: "linear-gradient(135deg,#355CFF,#7AA0FF)", color: "white", display: "grid", placeItems: "center", fontFamily: "var(--pc-serif)", fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", boxShadow: "var(--pc-shadow-sm)", border: "2px solid white" }}>AK</div>
        <div style={{ flex: 1 }}>
          <div className="pc-serif" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.018em" }}>Aarav Kapoor</div>
          <div style={{ fontSize: 12, color: "var(--pc-ink-3)", marginTop: 2 }}>Vice Principal · Examinations · <Tag tone="is-info">Admin</Tag></div>
          <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginTop: 4 }}>Joined 14 Aug 2019 · 6 years 9 months</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button className="pc-btn is-sm"><Icon name="upload" size={11} />Upload photo</button>
          <button className="pc-btn is-sm is-ghost">Remove</button>
        </div>
      </div>
      <div style={{ paddingTop: 4 }}>
        <Row label="Full name"     hint="Your legal name as it appears on school records."><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><Inp value="Aarav" /><Inp value="Kapoor" /></div></Row>
        <Row label="Display name"  hint="Shown in comments and the activity feed."><Inp value="Aarav K." w={260} /></Row>
        <Row label="Title"         hint="Your formal title within the school."><Inp value="Vice Principal — Examinations" /></Row>
        <Row label="Email"         hint="Used for sign-in and approval notifications."><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Inp value="aarav.kapoor@svn.edu.in" /><Tag tone="is-success"><Icon name="check" size={9} stroke={3} /> Verified</Tag></div></Row>
        <Row label="Phone"         hint="For two-factor authentication."><div style={{ display: "flex", gap: 8 }}><Sel value="+91" w={80} /><Inp value="98765 43210" /></div></Row>
        <Row label="Languages"     hint="Languages you teach or grade in."><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["English","Hindi","Sanskrit"].map(l => <span key={l} className="pc-tag" style={{ height: 22, fontSize: 11 }}>{l} <Icon name="plus" size={9} style={{ transform: "rotate(45deg)", marginLeft: 4, opacity: 0.5 }} /></span>)}<button className="pc-btn is-sm is-ghost" style={{ height: 22, padding: "0 8px" }}><Icon name="plus" size={10} />Add</button></div></Row>
      </div>
    </Card>

    <Card title="Role & permissions" subtitle="Set by your workspace admin. Contact admin to request changes.">
      <Row label="Role" hint="Determines which areas of PaperCraft you can access."><Tag tone="is-info">Workspace Admin</Tag></Row>
      <Row label="Subjects" hint="You appear as a SME for these subjects in approval routing."><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["Social Science","History","Civics"].map(l => <span key={l} className="pc-tag" style={{ height: 22, fontSize: 11 }}>{l}</span>)}</div></Row>
      <Row label="Classes" hint="Grade levels under your purview."><span style={{ fontSize: 12.5, color: "var(--pc-ink-2)" }}>Class VI — Class X</span></Row>
      <Row label="Approval authority" hint="Maximum paper you can approve without escalation."><span style={{ fontSize: 12.5, color: "var(--pc-ink-2)" }}>All papers · No limit</span></Row>
    </Card>

    <Card title="Activity summary" subtitle="Read-only stats from the last 90 days." padded={false}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
        {[["Papers approved","48"],["Avg. review time","2.4h"],["Active drafts","3"],["Comments left","127"]].map(([k,v],i) => (
          <div key={k} style={{ padding: "16px 18px", borderRight: i < 3 ? "1px solid var(--pc-line)" : 0 }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{k}</div>
            <div className="pc-serif pc-num" style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.025em", marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
    </Card>
  </AcctShell>
);

// ═════════════ ② SCHOOL / WORKSPACE ═════════════
const ScreenSchool = () => (
  <AcctShell active="school" title="School / Workspace" subtitle="Identity, branding and academic policy for your entire PaperCraft workspace. Changes here affect every teacher in the school.">
    <Card title="School identity" subtitle="Appears on every exported paper header.">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, paddingBottom: 14, borderBottom: "1px solid var(--pc-line)" }}>
        <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", display: "grid", placeItems: "center", boxShadow: "var(--pc-shadow-sm)", padding: 8 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="#15161A" strokeWidth="1.5" /><path d="M24 10 L34 24 L24 38 L14 24 Z" fill="#355CFF" opacity="0.16" /><path d="M24 14 L31 24 L24 34 L17 24 Z" stroke="#15161A" strokeWidth="1.2" /><text x="24" y="27" textAnchor="middle" fontFamily="serif" fontSize="9" fontWeight="600" fill="#15161A">SVN</text></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="pc-serif" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.018em" }}>Saraswati Vidya Niketan</div>
          <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", marginTop: 2 }}>Senior Secondary · Estd. 1962 · Lucknow</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <Tag tone="is-info">Plan: Institution</Tag>
            <Tag tone="is-success"><Icon name="check" size={9} stroke={3} /> Verified</Tag>
            <Tag>CBSE Affiliation #2130456</Tag>
          </div>
        </div>
        <button className="pc-btn is-sm"><Icon name="image" size={11} />Replace logo</button>
      </div>
      <div style={{ paddingTop: 4 }}>
        <Row label="Display name" hint="Used in the paper header."><Inp value="Saraswati Vidya Niketan" /></Row>
        <Row label="Sub-line"     hint="Smaller line below the school name on papers."><Inp value="Senior Secondary · Estd. 1962 · Lucknow" /></Row>
        <Row label="Address"      hint="Printed on the back cover when enabled."><Inp value="12 Mahatma Gandhi Marg, Hazratganj, Lucknow 226001" /></Row>
        <Row label="Affiliation"  hint="Board affiliation number."><Inp value="CBSE · #2130456" mono /></Row>
        <Row label="Website"      hint="Optional, shown in template footers."><Inp value="www.svn.edu.in" /></Row>
      </div>
    </Card>

    <Card title="Academic session" subtitle="The current session controls which year's papers, blueprints and curriculum are shown by default.">
      <Row label="Active session"><Sel value="2025–26 · Term II" w={260} /></Row>
      <Row label="Term boundary" hint="When this term ends, drafts roll over but archived papers do not."><span style={{ fontSize: 12.5, color: "var(--pc-ink-2)" }}>21 Mar 2026 — 30 Apr 2026</span></Row>
      <Row label="Grading system"><Seg options={["Marks","Grades","Hybrid"]} active={2} /></Row>
      <Row label="Default language"><Seg options={["English","Hindi","Bilingual"]} active={2} /></Row>
      <Row label="Date format"><Seg options={["DD MMM YYYY","DD/MM/YYYY","MMM D, YYYY"]} active={0} /></Row>
    </Card>

    <Card title="Branding & paper defaults" subtitle="Applied to all new papers. Individual papers can override.">
      <Row label="Header preset" hint="Default header layout when starting a new paper.">
        <div style={{ display: "flex", gap: 8 }}>
          {["Compact","Standard","Spacious"].map((l,i) => (
            <div key={l} style={{ flex: 1, border: "1px solid " + (i === 1 ? "var(--pc-primary)" : "var(--pc-line)"), borderRadius: 8, padding: 8, background: i === 1 ? "var(--pc-primary-50)" : "var(--pc-surface)", boxShadow: i === 1 ? "0 0 0 3px rgba(53,92,255,0.10)" : "var(--pc-shadow-xs)", textAlign: "center", cursor: "pointer" }}>
              <div style={{ height: 38, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", borderRadius: 4, padding: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ height: 4, background: "rgba(20,22,26,0.30)", borderRadius: 1 }} />
                <div style={{ height: 3, background: "rgba(20,22,26,0.16)", borderRadius: 1, width: "70%", alignSelf: "center" }} />
                <div style={{ height: 2, background: "rgba(20,22,26,0.10)", borderRadius: 1, marginTop: "auto" }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: i === 1 ? "var(--pc-primary-ink)" : "var(--pc-ink-3)", marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </Row>
      <Row label="Default font" hint="Body text on printed papers."><Sel value="Newsreader · Serif" w={260} /></Row>
      <Row label="Paper size"><Seg options={["A4","Letter","Legal"]} active={0} /></Row>
      <Row label="Default watermark" hint="Light pattern behind the paper.">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Switch on /><span style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>SVN monogram · 6% opacity</span></div>
      </Row>
      <Row label="Print footer" hint="Last line on every page."><Inp value="© Saraswati Vidya Niketan · Confidential · For internal use only" /></Row>
    </Card>

    <Card title="Plan & billing" subtitle="Workspace plan and seat usage.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, paddingBottom: 14, borderBottom: "1px solid var(--pc-line)" }}>
        {[["Plan","Institution",""],["Teachers","42 / 60","seats used"],["Renewal","12 Apr 2026","Auto-renew on"]].map(([k,v,s]) => (
          <div key={k}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{k}</div>
            <div className="pc-serif" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em", marginTop: 4 }}>{v}</div>
            {s && <div style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{s}</div>}
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 14, display: "flex", gap: 8 }}>
        <button className="pc-btn is-sm"><Icon name="file" size={11} />View invoices</button>
        <button className="pc-btn is-sm"><Icon name="users" size={11} />Add seats</button>
        <span style={{ flex: 1 }} />
        <button className="pc-btn is-sm is-ghost" style={{ color: "var(--pc-danger)" }}>Cancel plan</button>
      </div>
    </Card>
  </AcctShell>
);

// ═════════════ ③ TEACHER MANAGEMENT ═════════════
const TEACHERS = [
  { n: "Priya Sharma",     r: "Senior Teacher",  s: "Mathematics",       c: "VIII–X", last: "2m ago",    st: "Active",  inv: "MAU", a: "is-amber",  pap: 18, init: "PS" },
  { n: "Rajesh Verma",     r: "Head of Dept",    s: "Social Science",    c: "VI–X",   last: "12m ago",   st: "Active",  inv: "MUA", a: "is-blue",   pap: 24, init: "RV" },
  { n: "Anjali Singh",     r: "Teacher",         s: "English Literature", c: "IX–XII", last: "1h ago",    st: "Active",  inv: "MU",  a: "is-green",  pap: 11, init: "AS" },
  { n: "Vikram Patel",     r: "Teacher",         s: "Science · Physics", c: "XI–XII", last: "3h ago",    st: "Active",  inv: "U",   a: "is-purple", pap: 9,  init: "VP" },
  { n: "Sunita Iyer",      r: "Senior Teacher",  s: "Hindi · Sanskrit",  c: "VI–X",   last: "Yesterday", st: "Active",  inv: "MA",  a: "is-amber",  pap: 16, init: "SI" },
  { n: "Mohit Aggarwal",   r: "Teacher",         s: "Geography",         c: "VI–IX",  last: "2 days",    st: "Pending", inv: "—",   a: "is-blue",   pap: 0,  init: "MA" },
  { n: "Kavita Reddy",     r: "Teacher",         s: "Biology",           c: "IX–XII", last: "5 days",    st: "Active",  inv: "MU",  a: "is-green",  pap: 7,  init: "KR" },
  { n: "Anand Joshi",      r: "Visiting",        s: "Economics",         c: "XI–XII", last: "12 days",   st: "Paused",  inv: "M",   a: "is-purple", pap: 4,  init: "AJ" },
];

const InvCap = ({ caps, av }) => (
  <div style={{ display: "inline-flex", gap: 3 }}>
    {["M","U","A"].map(c => {
      const on = caps.includes(c);
      const labels = { M: "Make papers", U: "Update papers", A: "Approve papers" };
      return (
        <span key={c} title={labels[c]} style={{
          width: 20, height: 20, borderRadius: 4, display: "grid", placeItems: "center",
          fontSize: 10, fontFamily: "var(--pc-mono)", fontWeight: 500,
          background: on ? "var(--pc-primary-50)" : "var(--pc-surface-3)",
          color: on ? "var(--pc-primary-ink)" : "var(--pc-ink-5)",
          border: "1px solid " + (on ? "var(--pc-primary-100)" : "var(--pc-line)"),
        }}>{c}</span>
      );
    })}
  </div>
);

const ScreenTeachers = () => (
  <AcctShell active="teachers" title="Teacher Management" subtitle="Manage who can author, edit and approve papers in your workspace. Use the M / U / A capability grid to grant precise permissions per teacher."
    action={<><button className="pc-btn"><Icon name="upload" size={13} />Bulk invite</button><button className="pc-btn is-primary"><Icon name="plus" size={13} />Invite teacher</button></>}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
      {[["Total teachers","42"],["Active this week","31"],["Pending invites","3"],["Paused","2"]].map(([k,v]) => (
        <div key={k} style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)" }}>
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{k}</div>
          <div className="pc-serif pc-num" style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.025em", marginTop: 4 }}>{v}</div>
        </div>
      ))}
    </div>

    <Card padded={false}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--pc-line)", display: "flex", alignItems: "center", gap: 10, background: "var(--pc-surface-2)" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Icon name="search" size={13} style={{ position: "absolute", left: 10, top: 9, color: "var(--pc-ink-4)" }} />
          <input placeholder="Search teachers by name, subject…" style={{ width: "100%", height: 30, padding: "0 11px 0 30px", borderRadius: 7, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", fontSize: 12, fontFamily: "var(--pc-sans)", outline: "none", boxShadow: "var(--pc-shadow-xs)" }} />
        </div>
        <Seg options={["All · 42","Active · 31","Pending · 3","Paused · 2"]} active={0} />
        <span style={{ flex: 1 }} />
        <button className="pc-btn is-sm"><Icon name="filter" size={12} />Subject</button>
        <button className="pc-btn is-sm"><Icon name="filter" size={12} />Class</button>
        <button className="pc-btn is-sm"><Icon name="download" size={12} />Export</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,1.6fr) minmax(160px,1.2fr) 110px 110px 110px 86px 36px", padding: "10px 16px", borderBottom: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Chk /> Teacher</span>
        <span>Subject · Classes</span>
        <span>Capabilities</span>
        <span>Papers</span>
        <span>Last active</span>
        <span>Status</span>
        <span></span>
      </div>

      {TEACHERS.map((t, i) => (
        <div key={t.n} style={{ display: "grid", gridTemplateColumns: "minmax(220px,1.6fr) minmax(160px,1.2fr) 110px 110px 110px 86px 36px", padding: "12px 16px", borderBottom: i < TEACHERS.length - 1 ? "1px solid var(--pc-line)" : 0, alignItems: "center", background: i === 0 ? "rgba(53,92,255,0.025)" : "transparent" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Chk on={i === 0} />
            <div className={"pc-avatar " + t.a} style={{ width: 30, height: 30, fontSize: 11 }}>{t.init}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>{t.n}</div>
              <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{t.r}</div>
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--pc-ink-2)" }}>{t.s}</div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>Class {t.c}</div>
          </div>
          <InvCap caps={t.inv} />
          <span className="pc-num" style={{ fontSize: 12.5, color: "var(--pc-ink-2)", fontWeight: 500 }}>{t.pap}</span>
          <span style={{ fontSize: 11.5, color: "var(--pc-ink-3)" }}>{t.last}</span>
          <span>
            {t.st === "Active" && <Tag tone="is-success">Active</Tag>}
            {t.st === "Pending" && <Tag tone="is-warning">Pending</Tag>}
            {t.st === "Paused" && <Tag>Paused</Tag>}
          </span>
          <button className="pc-icon-btn" style={{ width: 26, height: 26 }}><Icon name="dots" size={13} /></button>
        </div>
      ))}

      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, background: "var(--pc-surface-2)" }}>
        <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Showing 8 of 42 teachers</span>
        <span style={{ flex: 1 }} />
        <button className="pc-btn is-sm">Previous</button>
        <button className="pc-btn is-sm">Next</button>
      </div>
    </Card>

    <Card title="Capability legend" subtitle="The M · U · A grid above is shorthand for what each teacher can do.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {[
          ["M", "Make papers", "Create new papers from scratch, the generator, or templates."],
          ["U", "Update papers", "Edit papers authored by others, within their subject scope."],
          ["A", "Approve papers", "Sign off on papers in their subject for final printing."],
        ].map(([c, t, d]) => (
          <div key={c} style={{ padding: 12, border: "1px solid var(--pc-line)", borderRadius: 8, background: "var(--pc-surface-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 24, height: 24, borderRadius: 5, display: "grid", placeItems: "center", fontSize: 11, fontFamily: "var(--pc-mono)", fontWeight: 600, background: "var(--pc-primary-50)", color: "var(--pc-primary-ink)", border: "1px solid var(--pc-primary-100)" }}>{c}</span>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>{t}</span>
            </div>
            <p style={{ fontSize: 11.5, color: "var(--pc-ink-3)", margin: "8px 0 0", lineHeight: 1.5 }}>{d}</p>
          </div>
        ))}
      </div>
    </Card>
  </AcctShell>
);

// ═════════════ ④ NOTIFICATIONS CENTER ═════════════
const NOTIF_GROUPS = [
  { title: "Today", items: [
    { i: "check",     t: "Class IX Social Science paper approved",       s: "Aarav Kapoor approved your draft. Ready to print.",         m: "12m ago", tone: "success", unread: true,  by: "AK" },
    { i: "msg",       t: "Priya Sharma left a comment on Q14",            s: "“This question may be too difficult for the cohort.”",       m: "1h ago",  tone: "info",    unread: true,  by: "PS" },
    { i: "warn",      t: "Blueprint mismatch · Class X · Mathematics",    s: "Selected questions are 4 marks under the blueprint target.", m: "2h ago",  tone: "warning", unread: true,  by: null },
  ]},
  { title: "Yesterday", items: [
    { i: "edit",      t: "Rajesh Verma requested changes",                s: "On Half-Yearly History paper · 3 comments to address.",      m: "Yesterday", tone: "warning", unread: false, by: "RV" },
    { i: "sparkles",  t: "12 new questions added to repository",          s: "Imported from CBSE 2024 question paper · Chapter 5–7.",      m: "Yesterday", tone: "info",    unread: false, by: null },
    { i: "users",     t: "Anjali Singh accepted your invite",             s: "She now has Make + Update capabilities for English.",        m: "Yesterday", tone: "info",    unread: false, by: "AS" },
  ]},
  { title: "Earlier this week", items: [
    { i: "archive",   t: "Paper archive · Quarterly papers moved",        s: "All Q1 papers are now in the 2025–26 archive.",              m: "Mon",     tone: "info",    unread: false, by: null },
    { i: "lock",      t: "Sign-in from a new device",                     s: "Windows · Chrome · Lucknow · 22 Sep 14:08 IST",              m: "Mon",     tone: "warning", unread: false, by: null },
  ]},
];

const toneBg = (t) => ({ success: "var(--pc-success-bg)", warning: "var(--pc-warning-bg)", info: "var(--pc-info-bg)" }[t]);
const toneFg = (t) => ({ success: "var(--pc-success)",    warning: "var(--pc-warning)",    info: "var(--pc-primary)" }[t]);

const ScreenNotifications = () => (
  <AcctShell active="notify" title="Notifications" subtitle="Stay on top of approvals, comments, blueprint warnings and workspace activity. Tune what reaches you via email, app and the daily digest."
    action={<><button className="pc-btn is-sm"><Icon name="check" size={11} stroke={3} />Mark all read</button></>}>
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
      {/* Feed */}
      <Card title="Inbox" subtitle="3 unread · last 7 days" padded={false}
        action={<Seg options={["All","Unread","Mentions"]} active={0} />}>
        {NOTIF_GROUPS.map(g => (
          <div key={g.title}>
            <div style={{ padding: "10px 18px", background: "var(--pc-surface-2)", borderBottom: "1px solid var(--pc-line)", fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{g.title}</div>
            {g.items.map((n, i) => (
              <div key={i} style={{ padding: "14px 18px", borderBottom: "1px solid var(--pc-line)", display: "flex", gap: 12, alignItems: "flex-start", background: n.unread ? "rgba(53,92,255,0.025)" : "transparent", cursor: "pointer" }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: toneBg(n.tone), color: toneFg(n.tone), display: "grid", placeItems: "center", flexShrink: 0, border: "1px solid " + toneFg(n.tone) + "22" }}>
                  <Icon name={n.i} size={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    {n.unread && <span style={{ width: 6, height: 6, borderRadius: 4, background: "var(--pc-primary)", flexShrink: 0 }} />}
                    <span className="pc-serif" style={{ fontSize: 13, fontWeight: 500, color: "var(--pc-ink)", letterSpacing: "-0.012em", lineHeight: 1.35 }}>{n.t}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)", flexShrink: 0 }}>{n.m}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--pc-ink-3)", marginTop: 3, lineHeight: 1.45 }}>{n.s}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </Card>

      {/* Preferences */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Card title="Delivery channels" subtitle="Where you'd like to be reached.">
          <Row label={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon name="msg" size={14} style={{ color: "var(--pc-ink-4)" }} />In-app</span>} hint="Bell icon in the top bar."><Switch on /></Row>
          <Row label={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon name="file" size={14} style={{ color: "var(--pc-ink-4)" }} />Email digest</span>} hint="Daily summary at 8:00 AM."><Switch on /></Row>
          <Row label={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon name="bell" size={14} style={{ color: "var(--pc-ink-4)" }} />Email · instant</span>} hint="For approvals and mentions only."><Switch on /></Row>
          <Row label={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon name="play" size={14} style={{ color: "var(--pc-ink-4)" }} />Mobile push</span>} hint="Via PaperCraft Companion app."><Switch /></Row>
        </Card>

        <Card title="What to notify me about">
          {[
            ["Approvals", "Papers awaiting your review", true],
            ["Comments & mentions", "When teachers @-mention you", true],
            ["Blueprint warnings", "Mark distribution issues", true],
            ["Repository updates", "New questions added", false],
            ["Workspace changes", "New teachers, role changes", true],
            ["Security alerts", "Sign-ins, password changes", true],
            ["Tips & product news", "Weekly digest from PaperCraft", false],
          ].map(([t, s, on]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--pc-line)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: "var(--pc-ink)", fontWeight: 500 }}>{t}</div>
                <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginTop: 1 }}>{s}</div>
              </div>
              <Switch on={on} />
            </div>
          ))}
        </Card>

        <Card title="Quiet hours" subtitle="Pause non-urgent notifications.">
          <Row label="Enable quiet hours"><Switch on /></Row>
          <Row label="From / To"><div style={{ display: "flex", gap: 8 }}><Sel value="9:00 PM" w={110} /><span style={{ color: "var(--pc-ink-4)", lineHeight: "32px", fontSize: 12 }}>to</span><Sel value="7:30 AM" w={110} /></div></Row>
          <Row label="Time zone"><Sel value="Asia/Kolkata · IST" /></Row>
        </Card>
      </div>
    </div>
  </AcctShell>
);

// ═════════════ ⑤ PREFERENCES & APPEARANCE ═════════════
const ThemeCard = ({ label, active, swatches }) => (
  <div style={{
    flex: 1, border: "1px solid " + (active ? "var(--pc-primary)" : "var(--pc-line)"),
    borderRadius: 10, padding: 10, background: active ? "var(--pc-primary-50)" : "var(--pc-surface)",
    boxShadow: active ? "0 0 0 3px rgba(53,92,255,0.10)" : "var(--pc-shadow-xs)", cursor: "pointer",
  }}>
    <div style={{ height: 84, borderRadius: 7, overflow: "hidden", border: "1px solid var(--pc-line)", background: swatches.bg, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ height: 6, background: swatches.line, borderRadius: 2, width: "60%" }} />
      <div style={{ flex: 1, background: swatches.paper, borderRadius: 4, padding: 6, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ height: 3, background: swatches.text1, width: "50%", borderRadius: 1 }} />
        <div style={{ height: 2, background: swatches.text2, width: "80%", borderRadius: 1 }} />
        <div style={{ height: 2, background: swatches.text2, width: "70%", borderRadius: 1 }} />
        <div style={{ marginTop: "auto", height: 5, background: swatches.accent, borderRadius: 2, width: "30%" }} />
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: active ? "var(--pc-primary-ink)" : "var(--pc-ink)" }}>{label}</span>
      {active && <span style={{ marginLeft: "auto", width: 14, height: 14, borderRadius: 10, background: "var(--pc-primary)", display: "grid", placeItems: "center" }}><Icon name="check" size={9} stroke={3} style={{ color: "white" }} /></span>}
    </div>
  </div>
);

const AccentSwatch = ({ c, active }) => (
  <button title={c} style={{ width: 28, height: 28, borderRadius: 999, background: c, border: "2px solid " + (active ? "var(--pc-surface)" : "transparent"), boxShadow: active ? "0 0 0 2px " + c + ", var(--pc-shadow-xs)" : "var(--pc-shadow-xs)", cursor: "pointer" }} />
);

const ScreenPreferences = () => (
  <AcctShell active="prefs" title="Preferences & Appearance" subtitle="Tune the look and feel of PaperCraft to your taste. These settings apply to your account only — not the entire workspace.">
    <Card title="Theme">
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <ThemeCard label="Editorial Light" active swatches={{ bg: "#EFECE5", line: "#D1D4DB", paper: "#FBF8F1", text1: "#15161A", text2: "#7A7D86", accent: "#355CFF" }} />
        <ThemeCard label="Newsroom Dark" swatches={{ bg: "#1A1B1F", line: "#2E3037", paper: "#23252B", text1: "#E8E6DF", text2: "#8A8D95", accent: "#7AA0FF" }} />
        <ThemeCard label="System" swatches={{ bg: "#D8D6D0", line: "#9CA0AA", paper: "#EFECE5", text1: "#15161A", text2: "#7A7D86", accent: "#355CFF" }} />
      </div>
      <Row label="Accent color" hint="Used for primary actions, selections and focus rings.">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <AccentSwatch c="#355CFF" active />
          <AccentSwatch c="#0E7A52" />
          <AccentSwatch c="#A05F00" />
          <AccentSwatch c="#8B5CF6" />
          <AccentSwatch c="#C03A2B" />
          <span style={{ width: 1, height: 22, background: "var(--pc-line)", margin: "0 4px" }} />
          <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Default · PaperCraft Blue</span>
        </div>
      </Row>
      <Row label="Reduce motion" hint="Minimize animations and transitions across the app."><Switch /></Row>
      <Row label="High contrast" hint="Bolder borders and stronger text contrast."><Switch /></Row>
    </Card>

    <Card title="Typography" subtitle="Affects the in-app interface, not printed papers.">
      <Row label="Interface font"><Seg options={["Geist (default)","System sans","Inter"]} active={0} /></Row>
      <Row label="Editorial font" hint="Used for headings and the paper canvas."><Seg options={["Newsreader","Source Serif","Lora"]} active={0} /></Row>
      <Row label="Density" hint="Compact fits more on screen; comfortable adds breathing room."><Seg options={["Compact","Comfortable","Spacious"]} active={1} /></Row>
      <Row label="Text scale">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>A</span>
          <div style={{ flex: 1, maxWidth: 220, position: "relative", height: 18 }}>
            <div style={{ position: "absolute", top: 7, left: 0, right: 0, height: 4, borderRadius: 999, background: "var(--pc-surface-3)" }} />
            <div style={{ position: "absolute", top: 7, left: 0, width: "40%", height: 4, borderRadius: 999, background: "var(--pc-primary)" }} />
            <div style={{ position: "absolute", top: 1, left: "calc(40% - 8px)", width: 16, height: 16, borderRadius: 999, background: "white", border: "1px solid var(--pc-line-2)", boxShadow: "var(--pc-shadow-xs)" }} />
          </div>
          <span style={{ fontSize: 16, color: "var(--pc-ink-4)" }}>A</span>
          <span className="pc-num" style={{ fontSize: 12, color: "var(--pc-ink-2)", fontWeight: 500, minWidth: 36 }}>100%</span>
        </div>
      </Row>
    </Card>

    <Card title="Workspace defaults" subtitle="What to show when you open PaperCraft.">
      <Row label="Open on launch"><Sel value="Control Center" w={260} /></Row>
      <Row label="Sidebar"><Seg options={["Expanded","Compact"]} active={0} /></Row>
      <Row label="Default view in Repository"><Seg options={["Grid","List"]} active={1} /></Row>
      <Row label="Show difficulty pips on questions"><Switch on /></Row>
      <Row label="Confirm before deleting questions"><Switch on /></Row>
    </Card>

    <Card title="Locale & formatting">
      <Row label="Display language"><Sel value="English (India)" w={260} /></Row>
      <Row label="Numerals"><Seg options={["Western · 1234","Devanagari · १२३४"]} active={0} /></Row>
      <Row label="Week starts on"><Seg options={["Mon","Sun"]} active={0} /></Row>
      <Row label="Time format"><Seg options={["12-hour","24-hour"]} active={0} /></Row>
    </Card>
  </AcctShell>
);

// ═════════════ ⑥ SECURITY / SESSION ═════════════
const SESSIONS = [
  { dev: "MacBook Pro · macOS 14",   br: "Chrome · 128", loc: "Lucknow, IN", ip: "203.0.113.42",  ago: "Current session", current: true,  icon: "M" },
  { dev: "iPhone 15 · iOS 17",       br: "Safari Mobile", loc: "Lucknow, IN", ip: "203.0.113.42",  ago: "Active 2h ago",   current: false, icon: "i" },
  { dev: "Windows 11 · School lab",  br: "Edge · 128",    loc: "Lucknow, IN", ip: "10.16.42.18",   ago: "Active 1 day ago", current: false, icon: "W" },
  { dev: "iPad · iPadOS 17",         br: "Safari",        loc: "Delhi, IN",   ip: "152.59.0.7",    ago: "Active 12 days ago", current: false, icon: "P" },
];

const ScreenSecurity = () => (
  <AcctShell active="security" title="Security & Sessions" subtitle="Manage how you sign in and review the devices currently connected to your account.">
    {/* Posture summary */}
    <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12, padding: "16px 20px", boxShadow: "var(--pc-shadow-xs)", display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, background: "var(--pc-success-bg)", color: "var(--pc-success)", display: "grid", placeItems: "center", border: "1px solid #B9E5CE" }}>
        <Icon name="check" size={22} stroke={2.4} />
      </span>
      <div style={{ flex: 1 }}>
        <div className="pc-serif" style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.018em" }}>Your account is well-protected</div>
        <div style={{ fontSize: 12, color: "var(--pc-ink-3)", marginTop: 2 }}>Two-factor authentication is on · Last password change 28 days ago · No suspicious sign-ins.</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Security score</div>
        <div className="pc-serif pc-num" style={{ fontSize: 24, fontWeight: 500, color: "var(--pc-success)", letterSpacing: "-0.02em" }}>92<span style={{ color: "var(--pc-ink-4)", fontSize: 14, fontWeight: 400 }}> /100</span></div>
      </div>
    </div>

    <Card title="Sign-in" subtitle="How you sign in to PaperCraft.">
      <Row label="Email" hint="Primary identifier for your account."><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12.5, color: "var(--pc-ink-2)" }}>aarav.kapoor@svn.edu.in</span><Tag tone="is-success"><Icon name="check" size={9} stroke={3} /> Verified</Tag></div></Row>
      <Row label="Password" hint="Last changed 28 days ago."
        action={<button className="pc-btn is-sm">Change</button>}>
        <span className="pc-mono" style={{ fontSize: 13, letterSpacing: "0.2em", color: "var(--pc-ink-3)" }}>••••••••••••</span>
      </Row>
      <Row label="Single sign-on" hint="Connect Google Workspace via your school admin."
        action={<button className="pc-btn is-sm">Connect</button>}>
        <Tag>Not connected</Tag>
      </Row>
    </Card>

    <Card title="Two-factor authentication" subtitle="Require a second step at sign-in. Highly recommended.">
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--pc-success-bg)", border: "1px solid #B9E5CE", borderRadius: 8, marginBottom: 10 }}>
        <Icon name="lock" size={15} style={{ color: "var(--pc-success)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, color: "#0E7A52", fontWeight: 500 }}>Two-factor is ON</div>
          <div style={{ fontSize: 11, color: "#1F8B62", marginTop: 1 }}>Backup codes available · last used 14 Sep 2025</div>
        </div>
        <button className="pc-btn is-sm" style={{ background: "white", borderColor: "#B9E5CE", color: "#0E7A52" }}>Turn off</button>
      </div>
      <Row label="Authenticator app" hint="Google Authenticator, Authy, 1Password etc."
        action={<button className="pc-btn is-sm">Reconfigure</button>}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--pc-surface-3)", border: "1px solid var(--pc-line)", display: "grid", placeItems: "center" }}><Icon name="lock" size={11} /></span><span style={{ fontSize: 12.5, color: "var(--pc-ink-2)" }}>Authy · iPhone</span></div></Row>
      <Row label="SMS backup" hint="Sends code to your verified phone number."
        action={<Switch on />}><span style={{ fontSize: 12.5, color: "var(--pc-ink-2)" }}>+91 98765 43210</span></Row>
      <Row label="Backup codes" hint="One-time codes if you lose your phone."
        action={<button className="pc-btn is-sm"><Icon name="download" size={11} />Download</button>}><span style={{ fontSize: 12, color: "var(--pc-ink-3)" }}>8 of 10 unused</span></Row>
    </Card>

    <Card title="Active sessions" subtitle={SESSIONS.length + " devices currently signed in to this account."}
      action={<button className="pc-btn is-sm" style={{ color: "var(--pc-danger)" }}><Icon name="lock" size={11} />Sign out everywhere</button>} padded={false}>
      {SESSIONS.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < SESSIONS.length - 1 ? "1px solid var(--pc-line)" : 0, background: s.current ? "rgba(53,92,255,0.025)" : "transparent" }}>
          <span style={{ width: 36, height: 36, borderRadius: 8, background: "var(--pc-surface-3)", border: "1px solid var(--pc-line)", display: "grid", placeItems: "center", color: "var(--pc-ink-3)", fontFamily: "var(--pc-serif)", fontSize: 16, fontWeight: 500 }}>{s.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>{s.dev}</span>
              {s.current && <Tag tone="is-success">This device</Tag>}
            </div>
            <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginTop: 2, display: "flex", gap: 8 }}>
              <span>{s.br}</span><span>·</span><span>{s.loc}</span><span>·</span><span className="pc-mono">{s.ip}</span><span>·</span><span>{s.ago}</span>
            </div>
          </div>
          {!s.current && <button className="pc-btn is-sm" style={{ color: "var(--pc-danger)" }}>Sign out</button>}
        </div>
      ))}
    </Card>

    <Card title="Recent activity" subtitle="The last 5 security events on your account." padded={false}>
      {[
        { i: "lock",   t: "Successful sign-in",        s: "MacBook Pro · Chrome · Lucknow",            m: "Today, 9:14 AM",      tone: "success" },
        { i: "lock",   t: "Password changed",          s: "MacBook Pro · Chrome · Lucknow",            m: "28 days ago",         tone: "info" },
        { i: "warn",   t: "Sign-in attempt blocked",   s: "Unknown device · Mumbai · wrong 2FA code",  m: "31 days ago",         tone: "warning" },
        { i: "lock",   t: "Successful sign-in",        s: "iPad · Safari · Delhi",                     m: "32 days ago",         tone: "success" },
        { i: "user",   t: "Profile photo updated",     s: "MacBook Pro · Chrome · Lucknow",            m: "45 days ago",         tone: "info" },
      ].map((e, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 18px", borderBottom: i < 4 ? "1px solid var(--pc-line)" : 0 }}>
          <span style={{ width: 28, height: 28, borderRadius: 7, background: toneBg(e.tone), color: toneFg(e.tone), display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon name={e.i} size={13} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: "var(--pc-ink)", fontWeight: 500 }}>{e.t}</div>
            <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginTop: 1 }}>{e.s}</div>
          </div>
          <span style={{ fontSize: 11, color: "var(--pc-ink-4)", flexShrink: 0 }}>{e.m}</span>
        </div>
      ))}
    </Card>

    <Card title="Danger zone" subtitle="Irreversible account-level actions.">
      <Row label="Export account data" hint="A ZIP with your profile, drafts and activity log."
        action={<button className="pc-btn is-sm"><Icon name="download" size={11} />Request export</button>}><span style={{ fontSize: 12, color: "var(--pc-ink-3)" }}>Sent to your verified email within 24 hours.</span></Row>
      <Row label="Deactivate account" hint="Your data is preserved. You can be re-activated by an admin."
        action={<button className="pc-btn is-sm" style={{ color: "var(--pc-danger)", borderColor: "#F2C9C2" }}>Deactivate</button>}><span style={{ fontSize: 12, color: "var(--pc-ink-3)" }}>You will lose access immediately.</span></Row>
      <Row label="Delete account" hint="Permanently delete your profile, drafts and personal settings. School papers remain."
        action={<button className="pc-btn is-sm" style={{ background: "var(--pc-danger)", borderColor: "var(--pc-danger)", color: "white" }}>Delete account…</button>}><span style={{ fontSize: 12, color: "var(--pc-danger)", fontWeight: 500 }}>This cannot be undone.</span></Row>
    </Card>
  </AcctShell>
);

Object.assign(window, { ScreenProfile, ScreenSchool, ScreenTeachers, ScreenNotifications, ScreenPreferences, ScreenSecurity });
