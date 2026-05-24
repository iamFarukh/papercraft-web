// Blueprints.jsx — Blueprint workspace (6 screens)
//
// Architecture: Blueprints control ACADEMIC composition (sections, marks,
// syllabus weighting, difficulty). They are separate from Templates (visual).
//
// Flow:
//   ① Library   · Default + Custom blueprints, side-by-side
//   ② Detail    · Read view of one blueprint (Half-Yearly · CBSE X · Math)
//   ③ Create 1  · Basics — name, board, class, subject, total marks, duration
//   ④ Create 2  · Structure — sections, marks distribution, question types
//   ⑤ Create 3  · Syllabus weighting + difficulty mix
//   ⑥ Create 4  · Review & save (visibility, sharing, default flag)

// ───────────────────────────────────────────────────────────────────────────
// Mock data
// ───────────────────────────────────────────────────────────────────────────

const BP_DEFAULTS = [
  { id: "bp-ut",  name: "Unit Test",          exam: "Unit Test",    marks: 25,  dur: "1 hr",   secs: 2, board: "CBSE",  classes: "VI–X",   used: 184, hint: "Short, single-chapter assessment" },
  { id: "bp-pt",  name: "Periodic Test",      exam: "Periodic",     marks: 40,  dur: "1.5 hr", secs: 3, board: "CBSE",  classes: "VI–X",   used: 142, hint: "Mid-term cycle, two-chapter span" },
  { id: "bp-hy",  name: "Half-Yearly",        exam: "Half-Yearly",  marks: 80,  dur: "3 hr",   secs: 3, board: "CBSE",  classes: "IX–XII", used: 96,  hint: "Full syllabus to date · official format", flag: true },
  { id: "bp-an",  name: "Annual Examination", exam: "Annual",       marks: 80,  dur: "3 hr",   secs: 4, board: "CBSE",  classes: "IX–XII", used: 41,  hint: "Year-end, full syllabus" },
  { id: "bp-pb",  name: "Pre-Board",          exam: "Pre-Board",    marks: 80,  dur: "3 hr",   secs: 4, board: "CBSE",  classes: "X, XII", used: 28,  hint: "Mock paper · matches board paper-1 exactly" },
  { id: "bp-pw",  name: "Practice Worksheet", exam: "Worksheet",    marks: 30,  dur: "45 min", secs: 1, board: "—",     classes: "All",    used: 312, hint: "Untimed practice, flexible structure" },
  { id: "bp-rb",  name: "RBSE Half-Yearly",   exam: "Half-Yearly",  marks: 80,  dur: "3 hr 15", secs: 4, board: "RBSE", classes: "IX–XII", used: 18,  hint: "Rajasthan state board pattern" },
];

const BP_CUSTOM = [
  { id: "bp-c1", name: "Olympiad Practice · Maths",      exam: "Olympiad",    marks: 60, dur: "2 hr",   secs: 3, board: "Custom", classes: "VIII–X", used: 14, hint: "30 MCQ · 5 hard subjective", author: "Priya Menon",   updated: "12 Oct 2025" },
  { id: "bp-c2", name: "Weekly Assessment · Science",    exam: "Weekly",      marks: 20, dur: "40 min", secs: 2, board: "Custom", classes: "VI–VIII", used: 47, hint: "10 MCQ · 5 short answer · single chapter", author: "Rohit Banerjee", updated: "08 Oct 2025" },
  { id: "bp-c3", name: "School Internal · Class X",       exam: "Internal",    marks: 50, dur: "2 hr",   secs: 3, board: "Custom", classes: "X",       used: 22, hint: "Internal evaluation · 50% sections", author: "Aarav Kapoor",   updated: "01 Oct 2025" },
  { id: "bp-c4", name: "Foundation Batch · Maths",        exam: "Foundation",  marks: 100, dur: "2.5 hr", secs: 4, board: "Custom", classes: "IX–X",    used:  6, hint: "JEE/NEET prep · advanced subjective", author: "Priya Menon",   updated: "24 Sep 2025", draft: true },
];

const BP_CHAPTERS = [
  { name: "Real Numbers",            w: 6,  d: { e: 70, m: 25, h: 5 } },
  { name: "Polynomials",             w: 6,  d: { e: 40, m: 50, h: 10 } },
  { name: "Pair of Linear Equations", w: 8, d: { e: 25, m: 55, h: 20 } },
  { name: "Quadratic Equations",     w: 10, d: { e: 20, m: 50, h: 30 } },
  { name: "Arithmetic Progressions", w: 8,  d: { e: 30, m: 50, h: 20 } },
  { name: "Triangles",               w: 8,  d: { e: 25, m: 55, h: 20 } },
  { name: "Coordinate Geometry",     w: 6,  d: { e: 35, m: 50, h: 15 } },
  { name: "Trigonometry",            w: 10, d: { e: 20, m: 50, h: 30 } },
  { name: "Trig. Applications",      w: 6,  d: { e: 15, m: 55, h: 30 } },
  { name: "Circles",                 w: 6,  d: { e: 25, m: 60, h: 15 } },
  { name: "Surface Areas & Volumes", w: 6,  d: { e: 30, m: 55, h: 15 } },
  { name: "Statistics",              w: 6,  d: { e: 45, m: 45, h: 10 } },
  { name: "Probability",             w: 4,  d: { e: 60, m: 35, h: 5 } },
];

// ───────────────────────────────────────────────────────────────────────────
// Shared shell — sidebar + topbar
// ───────────────────────────────────────────────────────────────────────────

const BPShell = ({ children, crumbs, actions }) => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="blueprint" items={ADMIN_NAV}
        footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar crumbs={crumbs} actions={actions} />
        {children}
      </div>
    </div>
  </div>
);

// Small helpers
const SectionTitle = ({ kicker, title, hint, right }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 14 }}>
    <div style={{ flex: 1 }}>
      {kicker && <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>{kicker}</div>}
      <h2 className="pc-serif" style={{ fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: "-0.022em", color: "var(--pc-ink)" }}>{title}</h2>
      {hint && <div style={{ fontSize: 12.5, color: "var(--pc-ink-3)", marginTop: 4 }}>{hint}</div>}
    </div>
    {right}
  </div>
);

// Mini "blueprint card" — used in library
const BlueprintCard = ({ bp, type = "default" }) => {
  const isCustom = type === "custom";
  return (
    <div style={{
      background: "var(--pc-surface)",
      border: "1px solid var(--pc-line)",
      borderRadius: "var(--pc-r-lg)",
      boxShadow: "var(--pc-shadow-sm)",
      padding: "16px 18px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      position: "relative",
      cursor: "pointer",
    }}>
      {bp.flag && (
        <span className="pc-tag is-primary" style={{ position: "absolute", top: 14, right: 14, height: 18, fontSize: 10 }}>
          <Icon name="star" size={9} />Most used
        </span>
      )}
      {bp.draft && (
        <span className="pc-tag is-warning" style={{ position: "absolute", top: 14, right: 14, height: 18, fontSize: 10 }}>Draft</span>
      )}

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: isCustom ? "var(--pc-primary-50)" : "var(--pc-surface-3)", display: "grid", placeItems: "center" }}>
            <Icon name="target" size={11} style={{ color: isCustom ? "var(--pc-primary)" : "var(--pc-ink-3)" }} />
          </span>
          <span className="pc-tag is-outline" style={{ height: 18, fontSize: 10, padding: "0 6px" }}>{bp.board}</span>
          <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>· {bp.classes}</span>
        </div>
        <div className="pc-serif" style={{ fontSize: 16, fontWeight: 500, color: "var(--pc-ink)", letterSpacing: "-0.012em", lineHeight: 1.25 }}>{bp.name}</div>
        <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", marginTop: 3, lineHeight: 1.4 }}>{bp.hint}</div>
      </div>

      {/* mini stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "8px 0", borderTop: "1px dashed var(--pc-line)" }}>
        {[
          ["Marks", bp.marks],
          ["Time", bp.dur],
          ["Sections", bp.secs],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>{k}</div>
            <div className="pc-serif pc-num" style={{ fontSize: 15, fontWeight: 500, color: "var(--pc-ink)", letterSpacing: "-0.018em" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -4 }}>
        {isCustom ? (
          <>
            <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>by {bp.author}</span>
            <span style={{ fontSize: 10.5, color: "var(--pc-ink-5)" }}>· {bp.updated}</span>
          </>
        ) : (
          <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>Used <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{bp.used}</span> times</span>
        )}
        <button className="pc-btn is-sm is-ghost" style={{ marginLeft: "auto", padding: "0 6px" }}>
          <Icon name="arrowRight" size={12} />
        </button>
      </div>
    </div>
  );
};

// Step indicator strip
const StepStrip = ({ step }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0", marginBottom: 22 }}>
    {[
      ["Basics",      "Identity & academic context"],
      ["Structure",   "Sections & marks distribution"],
      ["Syllabus",    "Chapter weighting & difficulty"],
      ["Review",      "Confirm & save"],
    ].map(([name, hint], i) => {
      const n = i + 1;
      const done = n < step;
      const active = n === step;
      return (
        <React.Fragment key={name}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: done || active ? 1 : 0.55 }}>
            <span style={{
              width: 24, height: 24, borderRadius: 999,
              background: done ? "var(--pc-ink)" : active ? "var(--pc-primary)" : "var(--pc-surface)",
              border: "1px solid " + (done ? "var(--pc-ink)" : active ? "var(--pc-primary)" : "var(--pc-line)"),
              color: done || active ? "white" : "var(--pc-ink-4)",
              display: "grid", placeItems: "center",
              fontFamily: "var(--pc-sans)", fontSize: 11.5, fontWeight: 500,
            }}>
              {done ? <Icon name="check" size={12} /> : n}
            </span>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: active ? "var(--pc-ink)" : "var(--pc-ink-2)" }}>{name}</div>
              <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{hint}</div>
            </div>
          </div>
          {i < 3 && <div style={{ flex: 1, height: 1, background: done ? "var(--pc-ink)" : "var(--pc-line)", margin: "0 14px", opacity: done ? 0.45 : 1 }} />}
        </React.Fragment>
      );
    })}
  </div>
);

const WizardFooter = ({ step, primary = "Continue", canBack = true, secondary }) => (
  <div style={{ display: "flex", alignItems: "center", padding: "14px 22px", borderTop: "1px solid var(--pc-line)", background: "var(--pc-surface)", gap: 8 }}>
    <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Step <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{step}</span> of 4 · Changes auto-save to draft.</span>
    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
      {secondary}
      {canBack && <button className="pc-btn"><Icon name="arrowLeft" size={13} />Back</button>}
      <button className="pc-btn is-primary">{primary}<Icon name="arrowRight" size={13} /></button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// ① Blueprint Library
// ═══════════════════════════════════════════════════════════════════════════

const BPLibrary = () => (
  <BPShell
    crumbs={["Academic", "Blueprints"]}
    actions={
      <>
        <button className="pc-btn"><Icon name="upload" size={13} />Import</button>
        <button className="pc-btn is-primary"><Icon name="plus" size={13} />New blueprint</button>
      </>
    }
  >
    <main className="pc-scroll" style={{ padding: "26px 28px 40px", flex: 1, minHeight: 0 }}>
      <SectionTitle
        kicker="Blueprints"
        title="Academic skeletons for every paper"
        hint="Blueprints control structure, marks, syllabus weight and difficulty — but not visual identity. Start from a default or define your own."
        right={
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button className="pc-btn is-sm"><Icon name="filter" size={11} />Board · All</button>
            <button className="pc-btn is-sm"><Icon name="filter" size={11} />Class · All</button>
            <button className="pc-btn is-sm"><Icon name="sliders" size={11} />Subject · Maths</button>
            <span style={{ width: 1, height: 22, background: "var(--pc-line)", margin: "0 4px" }} />
            <button className="pc-btn is-sm is-ghost"><Icon name="grid" size={11} /></button>
            <button className="pc-btn is-sm is-ghost" style={{ background: "var(--pc-surface-3)" }}><Icon name="list" size={11} /></button>
          </div>
        }
      />

      {/* Top stats strip */}
      <div className="pc-panel pc-panel-pad" style={{ marginBottom: 22, padding: "16px 22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) auto", gap: 32, alignItems: "center" }}>
          <Stat label="Default blueprints" value="7" hint="Maintained by PaperCraft" />
          <Stat label="Custom blueprints" value="14" hint="Created by your school" />
          <Stat label="Papers built with" value="842" unit="this term" />
          <Stat label="Most used" value="Half-Yearly" hint="Across X & XII · 96 papers" />
          <div style={{ width: 200 }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 6 }}>Usage · last 12 weeks</div>
            <div style={{ height: 36 }}><Spark points={[18,22,28,32,30,35,42,48,52,49,56,64]} height={36} /></div>
          </div>
        </div>
      </div>

      {/* Default blueprints */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 12px" }}>
        <h3 className="pc-serif" style={{ fontSize: 17, fontWeight: 500, margin: 0, letterSpacing: "-0.018em" }}>Default · provided by PaperCraft</h3>
        <span className="pc-tag is-outline" style={{ height: 18, fontSize: 10 }}>Maintained · CBSE & RBSE</span>
        <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
        <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>7 blueprints</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {BP_DEFAULTS.slice(0, 4).map(bp => <BlueprintCard key={bp.id} bp={bp} type="default" />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
        {BP_DEFAULTS.slice(4).map(bp => <BlueprintCard key={bp.id} bp={bp} type="default" />)}
      </div>

      {/* Custom blueprints */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 12px" }}>
        <h3 className="pc-serif" style={{ fontSize: 17, fontWeight: 500, margin: 0, letterSpacing: "-0.018em" }}>Custom · Saraswati Vidya Niketan</h3>
        <span className="pc-tag is-primary" style={{ height: 18, fontSize: 10 }}>School-specific</span>
        <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
        <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>4 blueprints · 10 more across other subjects</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {BP_CUSTOM.map(bp => <BlueprintCard key={bp.id} bp={bp} type="custom" />)}
      </div>
    </main>
  </BPShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ② Blueprint Detail
// ═══════════════════════════════════════════════════════════════════════════

const StructureRow = ({ letter, name, qCount, qMarks, total, types }) => (
  <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 80px 80px 80px 90px", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--pc-line)", gap: 12 }}>
    <span className="pc-serif" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--pc-ink)" }}>{letter}</span>
    <div>
      <div className="pc-serif" style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.012em", color: "var(--pc-ink)" }}>{name}</div>
      <div style={{ fontSize: 11, color: "var(--pc-ink-3)", marginTop: 2, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {types.map(t => <span key={t} className="pc-tag is-outline" style={{ height: 17, fontSize: 9.5 }}>{t}</span>)}
      </div>
    </div>
    <div className="pc-num" style={{ fontSize: 12.5, color: "var(--pc-ink-2)", textAlign: "right" }}><span style={{ fontWeight: 500 }}>{qCount}</span> <span style={{ color: "var(--pc-ink-4)" }}>questions</span></div>
    <div className="pc-num" style={{ fontSize: 12.5, color: "var(--pc-ink-2)", textAlign: "right" }}><span style={{ fontWeight: 500 }}>{qMarks}m</span> <span style={{ color: "var(--pc-ink-4)" }}>each</span></div>
    <div className="pc-num" style={{ fontSize: 12.5, color: "var(--pc-ink)", textAlign: "right" }}>= <span style={{ fontWeight: 500 }}>{total}</span></div>
    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
      <button className="pc-btn is-sm is-ghost" style={{ padding: "0 6px" }}><Icon name="edit" size={11} /></button>
      <button className="pc-btn is-sm is-ghost" style={{ padding: "0 6px" }}><Icon name="dots" size={11} /></button>
    </div>
  </div>
);

const ChapterWeight = ({ name, w, d }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 240px", alignItems: "center", gap: 14, padding: "9px 0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="pc-serif" style={{ fontSize: 13, color: "var(--pc-ink)", letterSpacing: "-0.008em" }}>{name}</span>
    </div>
    <div className="pc-num" style={{ fontSize: 12.5, textAlign: "right", color: "var(--pc-ink-2)", fontWeight: 500 }}>{w}m <span style={{ color: "var(--pc-ink-4)", fontWeight: 400 }}>· {Math.round(w / 80 * 100)}%</span></div>
    <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", border: "1px solid var(--pc-line)" }}>
      <span style={{ width: `${d.e}%`, background: "var(--pc-success)" }} />
      <span style={{ width: `${d.m}%`, background: "var(--pc-primary)" }} />
      <span style={{ width: `${d.h}%`, background: "var(--pc-warning)" }} />
    </div>
  </div>
);

const BPDetail = () => (
  <BPShell
    crumbs={["Academic", "Blueprints", "Half-Yearly · CBSE X · Maths"]}
    actions={
      <>
        <button className="pc-btn"><Icon name="paperclip" size={13} />Duplicate</button>
        <button className="pc-btn"><Icon name="edit" size={13} />Edit</button>
        <button className="pc-btn is-primary"><Icon name="play" size={13} />Use blueprint</button>
      </>
    }
  >
    <main className="pc-scroll" style={{ padding: "26px 28px 40px", flex: 1, minHeight: 0 }}>

      {/* Hero */}
      <div className="pc-panel" style={{ padding: "22px 26px", marginBottom: 22, display: "grid", gridTemplateColumns: "1fr 360px", gap: 26 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className="pc-tag is-primary" style={{ height: 20 }}><Icon name="star" size={9} />Most used</span>
            <span className="pc-tag is-outline" style={{ height: 20 }}>CBSE · Class X</span>
            <span className="pc-tag is-outline" style={{ height: 20 }}>Mathematics</span>
            <span className="pc-tag" style={{ height: 20 }}>Default</span>
          </div>
          <h1 className="pc-serif" style={{ fontSize: 28, fontWeight: 500, margin: "0 0 6px", letterSpacing: "-0.024em", color: "var(--pc-ink)" }}>Half-Yearly Examination</h1>
          <p className="pc-serif" style={{ fontSize: 14, fontStyle: "italic", color: "var(--pc-ink-3)", margin: 0, lineHeight: 1.5, maxWidth: 580 }}>
            CBSE Class X · Mathematics · September cycle. Follows the official board paper-1 pattern with three compulsory sections, internal choice in Sections B and C, and full syllabus to date.
          </p>

          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(5, auto) 1fr", gap: 26 }}>
            <Stat label="Total marks" value="80" />
            <Stat label="Duration" value="3" unit="hr" />
            <Stat label="Sections" value="3" hint="A · B · C" />
            <Stat label="Questions" value="16" hint="6 + 6 + 4" />
            <Stat label="Used" value="96" unit="papers" hint="Across X-A · X-B · X-C" />
          </div>
        </div>

        {/* Right side · status & audit */}
        <div style={{ background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Lifecycle</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              ["Created", "Maintained by PaperCraft", "2024"],
              ["Last updated", "Schema v3 · marks rebalanced", "12 Sep 2025"],
              ["Adopted", "Used across 14 schools", "—"],
              ["Linked papers", "96 generated · 7 in approval", "—"],
            ].map(([k, v, when]) => (
              <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 11.5 }}>
                <span style={{ width: 92, color: "var(--pc-ink-4)" }}>{k}</span>
                <span style={{ flex: 1, color: "var(--pc-ink-2)" }}>{v}</span>
                <span className="pc-num" style={{ color: "var(--pc-ink-4)" }}>{when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, borderBottom: "1px solid var(--pc-line)", marginBottom: 18 }}>
        {["Structure", "Syllabus weighting", "Difficulty mix", "Usage history"].map((t, i) => (
          <button key={t} style={{
            background: "transparent", border: 0, padding: "10px 14px", cursor: "pointer", fontFamily: "var(--pc-sans)",
            fontSize: 12.5, fontWeight: 500,
            color: i === 0 ? "var(--pc-ink)" : "var(--pc-ink-4)",
            borderBottom: "2px solid " + (i === 0 ? "var(--pc-ink)" : "transparent"),
            marginBottom: -1,
          }}>{t}</button>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>Read-only · default blueprint</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 22 }}>
        {/* Left: Structure table */}
        <div className="pc-panel" style={{ padding: "16px 22px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Section structure</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--pc-ink-4)" }}>3 sections · 16 questions · 80 marks</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 80px 80px 80px 90px", padding: "4px 0 8px", borderBottom: "1px solid var(--pc-line)", gap: 12, fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
            <span>Sec.</span><span>Name & types</span><span style={{ textAlign: "right" }}>Count</span><span style={{ textAlign: "right" }}>Marks</span><span style={{ textAlign: "right" }}>Total</span><span style={{ textAlign: "right" }}>Edit</span>
          </div>
          <StructureRow letter="A" name="Compulsory · objective" qCount={6} qMarks={1} total={6}   types={["MCQ", "One-word", "Fill blanks"]} />
          <StructureRow letter="B" name="Short answer"           qCount={6} qMarks={3} total={18}  types={["SA-I", "SA-II", "Internal choice ×2"]} />
          <StructureRow letter="C" name="Long answer"            qCount={4} qMarks={5} total={20}  types={["LA", "Case-based ×1", "Internal choice ×1"]} />

          {/* Marks balance bar */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Marks balance</span>
              <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--pc-ink-2)" }}><span className="pc-num" style={{ fontWeight: 500 }}>44</span>/<span className="pc-num">80</span> allocated · 36 reserved for choice questions</span>
            </div>
            <div style={{ display: "flex", height: 14, borderRadius: 6, overflow: "hidden", border: "1px solid var(--pc-line)" }}>
              <span style={{ width: "7.5%",  background: "var(--pc-primary-200)", borderRight: "1px solid white" }} />
              <span style={{ width: "22.5%", background: "var(--pc-primary)",     borderRight: "1px solid white" }} />
              <span style={{ width: "25%",   background: "var(--pc-primary-700)", borderRight: "1px solid white" }} />
              <span style={{ width: "45%",   background: "var(--pc-surface-3)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10.5, color: "var(--pc-ink-4)" }}>
              <span>A · 6m</span><span>B · 18m</span><span>C · 20m</span><span>Choice reserve · 36m</span>
            </div>
          </div>
        </div>

        {/* Right: Difficulty + Question type */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="pc-panel" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Difficulty mix</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--pc-ink-4)" }}>across the paper</span>
            </div>
            {[
              ["Easy",   30, "var(--pc-success)"],
              ["Medium", 50, "var(--pc-primary)"],
              ["Hard",   20, "var(--pc-warning)"],
            ].map(([k, v, c]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "baseline", marginBottom: 3, fontSize: 12 }}>
                  <span style={{ color: "var(--pc-ink-2)" }}>{k}</span>
                  <span className="pc-num" style={{ marginLeft: "auto", color: "var(--pc-ink)", fontWeight: 500 }}>{v}%</span>
                </div>
                <div style={{ height: 6, background: "var(--pc-surface-3)", borderRadius: 999, overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${v}%`, background: c, borderRadius: 999 }} />
                </div>
              </div>
            ))}
            <div className="pc-callout" style={{ marginTop: 10, fontSize: 11.5, color: "var(--pc-ink-3)", fontStyle: "italic" }}>
              <span className="pc-serif">Balanced for the median student. Replace one Medium with Easy if class average &lt; 60%.</span>
            </div>
          </div>

          <div className="pc-panel" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Question types</span>
            </div>
            {[
              ["MCQ",            6, "1m"],
              ["One-word",       0, "1m"],
              ["Short answer",   6, "3m"],
              ["Long answer",    4, "5m"],
              ["Case-based",     1, "5m"],
            ].map(([k, n, m]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", padding: "6px 0", borderBottom: "1px dashed var(--pc-line)", fontSize: 12 }}>
                <span style={{ color: "var(--pc-ink-2)" }}>{k}</span>
                <span style={{ marginLeft: "auto", color: "var(--pc-ink-4)" }}>{m}</span>
                <span className="pc-num" style={{ width: 40, textAlign: "right", color: "var(--pc-ink)", fontWeight: 500 }}>× {n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Syllabus weighting full width below */}
        <div className="pc-panel" style={{ padding: "16px 22px 18px", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Syllabus weighting</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--pc-ink-4)" }}>13 chapters · 80 marks · CBSE Class X Mathematics</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 36 }}>
            <div>{BP_CHAPTERS.slice(0, 7).map(c => <ChapterWeight key={c.name} {...c} />)}</div>
            <div>{BP_CHAPTERS.slice(7).map(c => <ChapterWeight key={c.name} {...c} />)}</div>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--pc-line)", fontSize: 11, color: "var(--pc-ink-3)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, background: "var(--pc-success)", borderRadius: 2 }} />Easy</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, background: "var(--pc-primary)", borderRadius: 2 }} />Medium</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, background: "var(--pc-warning)", borderRadius: 2 }} />Hard</span>
            <span style={{ marginLeft: "auto" }}>Per-chapter difficulty mix shown in the bar to the right of each chapter.</span>
          </div>
        </div>
      </div>
    </main>
  </BPShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ③ Create · Step 1 — Basics
// ═══════════════════════════════════════════════════════════════════════════

const Field = ({ label, value, hint, span = 1, type = "text", options }) => (
  <label style={{ gridColumn: span === 2 ? "span 2" : span === 3 ? "span 3" : "auto", display: "flex", flexDirection: "column", gap: 5 }}>
    <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{label}</span>
    {type === "select" ? (
      <div style={{ height: 36, padding: "0 12px", borderRadius: 8, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", boxShadow: "var(--pc-shadow-xs)", display: "flex", alignItems: "center", fontSize: 13, color: "var(--pc-ink)", cursor: "pointer" }}>
        <span style={{ flex: 1 }}>{value}</span>
        <Icon name="chevDown" size={13} style={{ color: "var(--pc-ink-4)" }} />
      </div>
    ) : type === "textarea" ? (
      <textarea defaultValue={value} rows={2} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", fontSize: 12.5, fontFamily: "var(--pc-sans)", color: "var(--pc-ink)", outline: "none", boxShadow: "var(--pc-shadow-xs)", resize: "vertical", lineHeight: 1.5 }} />
    ) : (
      <input defaultValue={value} style={{ height: 36, padding: "0 12px", borderRadius: 8, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", fontSize: 13, fontFamily: label === "Blueprint name" ? "var(--pc-serif)" : "var(--pc-sans)", color: "var(--pc-ink)", outline: "none", boxShadow: "var(--pc-shadow-xs)" }} />
    )}
    {hint && <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{hint}</span>}
  </label>
);

const BPCreate1 = () => (
  <BPShell
    crumbs={["Academic", "Blueprints", "New blueprint"]}
    actions={<button className="pc-btn"><Icon name="eye" size={13} />Preview</button>}
  >
    <main className="pc-scroll" style={{ flex: 1, minHeight: 0, padding: "26px 32px 28px", maxWidth: 1100, width: "100%", margin: "0 auto" }}>
      <StepStrip step={1} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
        <div className="pc-panel" style={{ padding: "22px 24px 24px" }}>
          <div style={{ marginBottom: 18 }}>
            <h3 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: "-0.018em" }}>Identity & academic context</h3>
            <div style={{ fontSize: 12.5, color: "var(--pc-ink-3)", marginTop: 4 }}>Name it descriptively. The class/subject combination determines which syllabus chapters appear in Step 3.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Blueprint name" value="Pre-Board · December" span={2} hint="Used to identify this blueprint across the workspace." />
            <Field label="Description"    value="Mock board paper. Three-section CBSE pattern. Full syllabus. Used as final preparation before the actual board exam." span={2} type="textarea" />

            <Field label="Exam type"  value="Pre-Board"     type="select" />
            <Field label="Board"      value="CBSE"          type="select" />
            <Field label="Class"      value="X"             type="select" />
            <Field label="Subject"    value="Mathematics"   type="select" />
            <Field label="Total marks" value="80" />
            <Field label="Duration"    value="3 hr" hint="Auto-suggests time per question in Step 2." />
            <Field label="Term"        value="Term II · 2025–26" type="select" />
            <Field label="Language"    value="English · Hindi (bilingual)" type="select" />
          </div>

          {/* Inherit / start from */}
          <div style={{ marginTop: 20, padding: "12px 14px", background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="layers" size={16} style={{ color: "var(--pc-ink-4)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>Inherit from existing blueprint</div>
              <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Copies structure & syllabus weights. You'll override what's different. Currently starting from <strong style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>Half-Yearly · CBSE X · Maths</strong>.</div>
            </div>
            <button className="pc-btn is-sm">Change</button>
          </div>
        </div>

        {/* Right · live skeleton preview */}
        <div className="pc-panel" style={{ padding: "16px 18px 18px", height: "fit-content", position: "sticky", top: 0 }}>
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Skeleton preview</div>

          <div style={{ background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", borderRadius: 6, padding: "16px 18px", boxShadow: "var(--pc-shadow-xs)" }}>
            <div className="pc-serif" style={{ fontSize: 13.5, fontWeight: 500, textAlign: "center", letterSpacing: "0.04em", textTransform: "uppercase" }}>Pre-Board Examination</div>
            <div className="pc-serif" style={{ fontSize: 10.5, fontStyle: "italic", textAlign: "center", color: "var(--pc-ink-3)", marginTop: 1 }}>December · 2025–26</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "6px 0", borderTop: "0.5px solid var(--pc-ink-4)", borderBottom: "0.5px solid var(--pc-ink-4)", fontSize: 10, color: "var(--pc-ink-2)" }}>
              <span>Class <strong style={{ fontWeight: 500 }}>X</strong></span>
              <span>Math</span>
              <span>3 hr</span>
              <span>80 marks</span>
            </div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10, opacity: 0.45 }}>
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <div className="pc-serif" style={{ fontSize: 10, fontWeight: 500 }}>Section {String.fromCharCode(64 + i)}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
                    {[1,2,3].map(j => <div key={j} style={{ height: 5, background: "var(--pc-line-2)", borderRadius: 2, width: `${100 - j * 12}%` }} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginTop: 12, lineHeight: 1.5 }}>
            Updates live as you fill in basics. Section structure becomes editable in the next step.
          </div>
        </div>
      </div>
    </main>
    <WizardFooter step={1} canBack={false} secondary={<button className="pc-btn">Save & exit</button>} />
  </BPShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ④ Create · Step 2 — Structure
// ═══════════════════════════════════════════════════════════════════════════

const StructureEditor = ({ letter, name, count, marks, types, internalChoice, active }) => (
  <div style={{
    background: active ? "var(--pc-primary-50)" : "var(--pc-surface)",
    border: "1px solid " + (active ? "var(--pc-primary)" : "var(--pc-line)"),
    borderRadius: 12,
    boxShadow: active ? "0 0 0 3px rgba(53,92,255,0.12), var(--pc-shadow-xs)" : "var(--pc-shadow-xs)",
    padding: "14px 16px",
    display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center",
  }}>
    <Icon name="drag" size={14} style={{ color: "var(--pc-ink-5)" }} />
    <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 90px 90px 90px 130px", alignItems: "center", gap: 14 }}>
      <span className="pc-serif" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--pc-ink)" }}>{letter}</span>
      <div>
        <input defaultValue={name} style={{ width: "100%", padding: "4px 0", border: 0, background: "transparent", fontFamily: "var(--pc-serif)", fontSize: 14, fontWeight: 500, color: "var(--pc-ink)", letterSpacing: "-0.012em", outline: "none" }} />
        <div style={{ fontSize: 11, color: "var(--pc-ink-3)", marginTop: 1, display: "flex", gap: 5, flexWrap: "wrap" }}>
          {types.map(t => <span key={t} className="pc-tag is-outline" style={{ height: 17, fontSize: 9.5 }}>{t}</span>)}
          <button style={{ background: "transparent", border: 0, color: "var(--pc-primary)", fontSize: 10.5, padding: 0, cursor: "pointer", fontFamily: "var(--pc-sans)" }}>+ type</button>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Count</div>
        <div style={{ marginTop: 4, height: 30, padding: "0 10px", border: "1px solid var(--pc-line)", borderRadius: 6, background: "var(--pc-surface)", display: "flex", alignItems: "center", fontSize: 13 }}>
          <span className="pc-num" style={{ fontWeight: 500 }}>{count}</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", flexDirection: "column", lineHeight: 0.6 }}>
            <Icon name="chevDown" size={10} style={{ transform: "rotate(180deg)", color: "var(--pc-ink-4)" }} />
            <Icon name="chevDown" size={10} style={{ color: "var(--pc-ink-4)" }} />
          </span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Marks each</div>
        <div style={{ marginTop: 4, height: 30, padding: "0 10px", border: "1px solid var(--pc-line)", borderRadius: 6, background: "var(--pc-surface)", display: "flex", alignItems: "center", fontSize: 13 }}>
          <span className="pc-num" style={{ fontWeight: 500 }}>{marks}</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Total</div>
        <div style={{ marginTop: 4, height: 30, padding: "0 10px", borderRadius: 6, background: "var(--pc-surface-3)", display: "flex", alignItems: "center", fontSize: 13 }}>
          <span className="pc-num pc-serif" style={{ fontWeight: 500, color: "var(--pc-ink)" }}>{count * marks}</span>
          <span style={{ marginLeft: 4, color: "var(--pc-ink-4)" }}>m</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Internal choice</div>
        <div style={{ marginTop: 4, height: 30, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 26, height: 16, background: internalChoice ? "var(--pc-primary)" : "var(--pc-surface-3)", borderRadius: 999, padding: 1.5, transition: "background .2s" }}>
            <span style={{ width: 13, height: 13, background: "white", borderRadius: 999, display: "block", transform: internalChoice ? "translateX(10px)" : "translateX(0)", transition: "transform .2s", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
          </span>
          <span style={{ fontSize: 11.5, color: "var(--pc-ink-3)" }}>{internalChoice ? "On · 2 Q" : "Off"}</span>
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 4 }}>
      <button className="pc-btn is-sm is-ghost" style={{ padding: "0 6px" }}><Icon name="setting" size={11} /></button>
      <button className="pc-btn is-sm is-ghost" style={{ padding: "0 6px" }}><Icon name="dots" size={11} /></button>
    </div>
  </div>
);

const BPCreate2 = () => (
  <BPShell
    crumbs={["Academic", "Blueprints", "New blueprint"]}
    actions={<button className="pc-btn"><Icon name="eye" size={13} />Preview</button>}
  >
    <main className="pc-scroll" style={{ flex: 1, minHeight: 0, padding: "26px 32px 28px", maxWidth: 1280, width: "100%", margin: "0 auto" }}>
      <StepStrip step={2} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 22 }}>
        <div className="pc-panel" style={{ padding: "22px 24px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <h3 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: "-0.018em" }}>Section structure</h3>
              <div style={{ fontSize: 12.5, color: "var(--pc-ink-3)", marginTop: 4 }}>Define each section's question count, marks, and types. Drag to reorder.</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button className="pc-btn is-sm"><Icon name="refresh" size={11} />Reset to CBSE</button>
              <button className="pc-btn is-sm is-primary"><Icon name="plus" size={11} />Add section</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StructureEditor letter="A" name="Compulsory · objective"   count={6} marks={1} types={["MCQ", "One-word"]}        internalChoice={false} />
            <StructureEditor letter="B" name="Short answer"              count={6} marks={3} types={["SA-I", "SA-II"]}          internalChoice={true} active />
            <StructureEditor letter="C" name="Long answer"               count={4} marks={5} types={["LA", "Case-based"]}       internalChoice={true} />
            <StructureEditor letter="D" name="Application · case study"  count={2} marks={5} types={["Case-based", "Source"]}   internalChoice={false} />
          </div>

          {/* Active section detail */}
          <div style={{ marginTop: 18, padding: "16px 18px", background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span className="pc-tag is-primary" style={{ height: 20 }}>Editing Section B</span>
              <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Short answer · 3 marks each · internal choice in 2 questions</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Section instructions" value="Internal choice provided in 2 questions. Show all working." span={3} type="textarea" />
              <Field label="Time per question"  value="6 min" hint="Auto-computed from duration. Override per section." />
              <Field label="Choice strategy"    value="2 of 6 questions" type="select" hint="Determines internal-choice pool size." />
              <Field label="Minimum chapters"   value="3 chapters" type="select" hint="Forces syllabus coverage during generation." />
            </div>
          </div>
        </div>

        {/* Right · balance panel */}
        <div className="pc-panel" style={{ padding: "16px 18px 18px", height: "fit-content", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Marks balance</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
              <span className="pc-serif pc-num" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.022em", color: "var(--pc-ink)" }}>54</span>
              <span style={{ fontSize: 14, color: "var(--pc-ink-4)" }}>/ 80 allocated</span>
              <span className="pc-tag is-warning" style={{ marginLeft: "auto", height: 20 }}>Under by 26</span>
            </div>
            <div className="pc-bar is-warning" style={{ marginTop: 10 }}><span style={{ width: "67.5%" }} /></div>
            <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginTop: 6 }}>26 marks remaining. Add another section or raise marks-per-question.</div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Distribution by section</div>
            <div style={{ display: "flex", height: 22, borderRadius: 6, overflow: "hidden", border: "1px solid var(--pc-line)" }}>
              <span style={{ width: "11%", background: "var(--pc-primary-200)" }} title="A · 6m" />
              <span style={{ width: "33%", background: "var(--pc-primary)" }} title="B · 18m" />
              <span style={{ width: "37%", background: "var(--pc-primary-700)" }} title="C · 20m" />
              <span style={{ width: "19%", background: "var(--pc-ink-2)" }} title="D · 10m" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10, fontSize: 11.5 }}>
              {[["A", 6, 11], ["B", 18, 33], ["C", 20, 37], ["D", 10, 19]].map(([k, m, p]) => (
                <div key={k} style={{ display: "flex", gap: 8 }}>
                  <span style={{ width: 14, color: "var(--pc-ink-4)" }}>{k}</span>
                  <span style={{ flex: 1, color: "var(--pc-ink-2)" }}><span className="pc-num" style={{ fontWeight: 500 }}>{m}</span> marks</span>
                  <span className="pc-num" style={{ color: "var(--pc-ink-4)" }}>{p}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Question type mix</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[["Objective (MCQ)", 6, "var(--pc-success)"], ["Short answer", 6, "var(--pc-primary)"], ["Long answer", 4, "var(--pc-warning)"], ["Case-based", 2, "var(--pc-ink-2)"]].map(([k, n, c]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 4, background: c }} />
                  <span style={{ color: "var(--pc-ink-2)" }}>{k}</span>
                  <span className="pc-num" style={{ marginLeft: "auto", fontWeight: 500, color: "var(--pc-ink)" }}>× {n}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pc-callout" style={{ fontSize: 11.5, color: "var(--pc-ink-2)", lineHeight: 1.5 }}>
            <span className="pc-serif" style={{ fontStyle: "italic" }}>CBSE Pre-Board typically uses 4 sections totalling 80 marks. Your structure currently matches that pattern.</span>
          </div>
        </div>
      </div>
    </main>
    <WizardFooter step={2} secondary={<button className="pc-btn">Save & exit</button>} />
  </BPShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ⑤ Create · Step 3 — Syllabus weighting
// ═══════════════════════════════════════════════════════════════════════════

const ChapterEditor = ({ name, w, d, included = true, locked }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "20px 1fr 90px 240px 100px 24px",
    alignItems: "center", gap: 14,
    padding: "10px 14px",
    background: "var(--pc-surface)",
    border: "1px solid " + (included ? "var(--pc-line)" : "transparent"),
    borderRadius: 8,
    opacity: included ? 1 : 0.45,
    boxShadow: included ? "var(--pc-shadow-xs)" : "none",
  }}>
    <span style={{ width: 16, height: 16, border: "1.5px solid " + (included ? "var(--pc-primary)" : "var(--pc-line-2)"), borderRadius: 4, background: included ? "var(--pc-primary)" : "transparent", display: "grid", placeItems: "center" }}>
      {included && <Icon name="check" size={11} style={{ color: "white" }} />}
    </span>
    <div>
      <div className="pc-serif" style={{ fontSize: 13.5, color: "var(--pc-ink)", letterSpacing: "-0.008em" }}>{name}</div>
      {locked && <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}><Icon name="lock" size={9} />Locked by board syllabus</div>}
    </div>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, height: 26, padding: "0 8px", border: "1px solid var(--pc-line)", borderRadius: 6, background: "var(--pc-surface-2)" }}>
        <button style={{ background: "transparent", border: 0, color: "var(--pc-ink-4)", cursor: "pointer", padding: 0, display: "grid", placeItems: "center" }}><Icon name="minus" size={11} /></button>
        <span className="pc-num" style={{ flex: 1, textAlign: "center", fontSize: 12.5, fontWeight: 500 }}>{w}m</span>
        <button style={{ background: "transparent", border: 0, color: "var(--pc-ink-4)", cursor: "pointer", padding: 0, display: "grid", placeItems: "center" }}><Icon name="plus" size={11} /></button>
      </div>
    </div>
    {/* Difficulty bar (interactive feel) */}
    <div>
      <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", border: "1px solid var(--pc-line)", position: "relative" }}>
        <span style={{ width: `${d.e}%`, background: "var(--pc-success)" }} />
        <span style={{ width: `${d.m}%`, background: "var(--pc-primary)" }} />
        <span style={{ width: `${d.h}%`, background: "var(--pc-warning)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 9.5, color: "var(--pc-ink-4)" }}>
        <span className="pc-num">{d.e}</span>
        <span className="pc-num">{d.m}</span>
        <span className="pc-num">{d.h}</span>
      </div>
    </div>
    <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", textAlign: "right" }}>
      ≈ <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{Math.ceil(w / 3)}</span> questions
    </div>
    <button className="pc-btn is-sm is-ghost" style={{ padding: "0 4px" }}><Icon name="dots" size={11} /></button>
  </div>
);

const BPCreate3 = () => (
  <BPShell
    crumbs={["Academic", "Blueprints", "New blueprint"]}
    actions={<button className="pc-btn"><Icon name="eye" size={13} />Preview</button>}
  >
    <main className="pc-scroll" style={{ flex: 1, minHeight: 0, padding: "26px 32px 28px", maxWidth: 1320, width: "100%", margin: "0 auto" }}>
      <StepStrip step={3} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 22 }}>
        <div className="pc-panel" style={{ padding: "20px 22px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 14 }}>
            <div>
              <h3 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: "-0.018em" }}>Syllabus weighting & difficulty</h3>
              <div style={{ fontSize: 12.5, color: "var(--pc-ink-3)", marginTop: 4 }}>Allocate marks across chapters. The generator pulls questions in proportion to these weights.</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button className="pc-btn is-sm"><Icon name="refresh" size={11} />Even split</button>
              <button className="pc-btn is-sm"><Icon name="target" size={11} />CBSE recommended</button>
            </div>
          </div>

          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 90px 240px 100px 24px", padding: "6px 14px", gap: 14, fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
            <span></span>
            <span>Chapter</span>
            <span>Marks</span>
            <span>Difficulty mix (E · M · H)</span>
            <span style={{ textAlign: "right" }}>Q approx.</span>
            <span></span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {BP_CHAPTERS.map((c, i) => (
              <ChapterEditor key={c.name} {...c} included={i !== 10} locked={i < 2} />
            ))}
          </div>

          <div style={{ marginTop: 16, padding: "12px 14px", borderTop: "1px solid var(--pc-line)", display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="info" size={14} style={{ color: "var(--pc-info)" }} />
            <span style={{ fontSize: 11.5, color: "var(--pc-ink-3)", flex: 1 }}>
              <span className="pc-serif" style={{ fontStyle: "italic" }}>Surface Areas & Volumes</span> is unchecked — its 6 marks were redistributed proportionally.
            </span>
            <button className="pc-btn is-sm is-ghost">Undo</button>
          </div>
        </div>

        {/* Right · balance + difficulty */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="pc-panel" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Total weighting</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
              <span className="pc-serif pc-num" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.022em", color: "var(--pc-ink)" }}>80</span>
              <span style={{ fontSize: 14, color: "var(--pc-ink-4)" }}>/ 80 marks</span>
              <span className="pc-tag is-success" style={{ marginLeft: "auto", height: 20 }}><Icon name="check" size={9} />Balanced</span>
            </div>
            <div className="pc-bar is-success" style={{ marginTop: 10 }}><span style={{ width: "100%" }} /></div>
            <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginTop: 6 }}>12 chapters included · 1 chapter skipped.</div>
          </div>

          <div className="pc-panel" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Global difficulty target</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Easy",   28, "var(--pc-success)", "30%"],
                ["Medium", 50, "var(--pc-primary)", "50%"],
                ["Hard",   22, "var(--pc-warning)", "20%"],
              ].map(([k, v, c, target]) => (
                <div key={k}>
                  <div style={{ display: "flex", alignItems: "baseline", marginBottom: 5, fontSize: 11.5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 4, background: c, marginRight: 6 }} />
                    <span style={{ color: "var(--pc-ink-2)" }}>{k}</span>
                    <span style={{ marginLeft: "auto" }} className="pc-num"><span style={{ color: "var(--pc-ink)", fontWeight: 500 }}>{v}%</span> <span style={{ color: "var(--pc-ink-4)" }}>· target {target}</span></span>
                  </div>
                  <div style={{ height: 6, background: "var(--pc-surface-3)", borderRadius: 999, position: "relative", overflow: "hidden" }}>
                    <span style={{ position: "absolute", left: target, top: -2, bottom: -2, width: 1, background: "var(--pc-ink-4)", opacity: 0.5 }} />
                    <span style={{ display: "block", height: "100%", width: `${v}%`, background: c, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pc-callout" style={{ marginTop: 12, fontSize: 11.5, color: "var(--pc-ink-3)" }}>
              <span className="pc-serif" style={{ fontStyle: "italic" }}>Difficulty mix is computed per chapter, then aggregated.</span>
            </div>
          </div>

          <div className="pc-panel" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Repository readiness</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 11.5 }}>
              <div style={{ display: "flex" }}><span style={{ color: "var(--pc-ink-3)" }}>Questions available</span><span className="pc-num" style={{ marginLeft: "auto", fontWeight: 500 }}>2,184</span></div>
              <div style={{ display: "flex" }}><span style={{ color: "var(--pc-ink-3)" }}>Chapters covered</span><span className="pc-num" style={{ marginLeft: "auto", fontWeight: 500 }}>12 / 12 ✓</span></div>
              <div style={{ display: "flex" }}><span style={{ color: "var(--pc-ink-3)" }}>Easy questions</span><span className="pc-num" style={{ marginLeft: "auto", fontWeight: 500 }}>612</span></div>
              <div style={{ display: "flex" }}><span style={{ color: "var(--pc-ink-3)" }}>Hard questions</span><span className="pc-num" style={{ marginLeft: "auto", color: "var(--pc-warning)", fontWeight: 500 }}>184 · low for hard target</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <WizardFooter step={3} secondary={<button className="pc-btn">Save & exit</button>} />
  </BPShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ⑥ Create · Step 4 — Review & save
// ═══════════════════════════════════════════════════════════════════════════

const ReviewBlock = ({ kicker, title, edit, children }) => (
  <div className="pc-panel" style={{ padding: "18px 22px" }}>
    <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{kicker}</div>
        <div className="pc-serif" style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.014em", color: "var(--pc-ink)", marginTop: 1 }}>{title}</div>
      </div>
      <button className="pc-btn is-sm is-ghost" style={{ marginLeft: "auto" }}>{edit}<Icon name="edit" size={11} /></button>
    </div>
    {children}
  </div>
);

const BPCreate4 = () => (
  <BPShell
    crumbs={["Academic", "Blueprints", "New blueprint"]}
    actions={<button className="pc-btn"><Icon name="eye" size={13} />Preview as paper</button>}
  >
    <main className="pc-scroll" style={{ flex: 1, minHeight: 0, padding: "26px 32px 28px", maxWidth: 1280, width: "100%", margin: "0 auto" }}>
      <StepStrip step={4} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <ReviewBlock kicker="Step 1" title="Identity & academic context" edit="Edit basics">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[
                ["Name",       "Pre-Board · December"],
                ["Exam type",  "Pre-Board"],
                ["Board",      "CBSE"],
                ["Class · Subject", "X · Mathematics"],
                ["Total marks", "80"],
                ["Duration",    "3 hr"],
                ["Term",        "Term II · 2025–26"],
                ["Language",    "Bilingual"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{k}</div>
                  <div className="pc-serif" style={{ fontSize: 14, fontWeight: 500, color: "var(--pc-ink)", marginTop: 3, letterSpacing: "-0.01em" }}>{v}</div>
                </div>
              ))}
            </div>
          </ReviewBlock>

          <ReviewBlock kicker="Step 2" title="Section structure" edit="Edit structure">
            <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 80px 80px 80px 90px", padding: "4px 0 8px", borderBottom: "1px solid var(--pc-line)", gap: 12, fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
              <span>Sec.</span><span>Name</span><span style={{ textAlign: "right" }}>Count</span><span style={{ textAlign: "right" }}>Each</span><span style={{ textAlign: "right" }}>Total</span><span style={{ textAlign: "right" }}>Choice</span>
            </div>
            {[
              ["A", "Compulsory · objective", 6, 1, 6,  "—"],
              ["B", "Short answer",            6, 3, 18, "2 of 6"],
              ["C", "Long answer",             4, 5, 20, "1 of 4"],
              ["D", "Application · case study", 2, 5, 10, "—"],
            ].map(([letter, name, c, m, t, ch]) => (
              <div key={letter} style={{ display: "grid", gridTemplateColumns: "30px 1fr 80px 80px 80px 90px", padding: "10px 0", gap: 12, alignItems: "center", borderBottom: "1px dashed var(--pc-line)" }}>
                <span className="pc-serif" style={{ fontSize: 16, fontWeight: 500, color: "var(--pc-ink)" }}>{letter}</span>
                <span className="pc-serif" style={{ fontSize: 13, color: "var(--pc-ink)" }}>{name}</span>
                <span className="pc-num" style={{ textAlign: "right", fontSize: 12.5, fontWeight: 500 }}>{c}</span>
                <span className="pc-num" style={{ textAlign: "right", fontSize: 12.5, color: "var(--pc-ink-3)" }}>{m}m</span>
                <span className="pc-num pc-serif" style={{ textAlign: "right", fontSize: 13, fontWeight: 500 }}>{t}</span>
                <span style={{ textAlign: "right", fontSize: 11, color: "var(--pc-ink-4)" }}>{ch}</span>
              </div>
            ))}
            <div style={{ display: "flex", marginTop: 10, fontSize: 12.5, alignItems: "baseline" }}>
              <span style={{ color: "var(--pc-ink-3)" }}>18 questions · 4 sections</span>
              <span style={{ marginLeft: "auto" }} className="pc-num pc-serif">Total <span style={{ fontWeight: 500, color: "var(--pc-ink)", fontSize: 15 }}>54</span> <span style={{ color: "var(--pc-ink-4)" }}>+ 26 choice = 80m</span></span>
            </div>
          </ReviewBlock>

          <ReviewBlock kicker="Step 3" title="Syllabus weighting & difficulty" edit="Edit weighting">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginBottom: 8 }}>12 chapters included · 80m balanced</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {BP_CHAPTERS.slice(0, 7).map(c => (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", fontSize: 11.5, gap: 8 }}>
                      <span style={{ flex: 1, color: "var(--pc-ink-2)" }} className="pc-serif">{c.name}</span>
                      <span className="pc-num" style={{ color: "var(--pc-ink-4)", width: 36, textAlign: "right" }}>{c.w}m</span>
                      <div style={{ width: 90, height: 5, background: "var(--pc-surface-3)", borderRadius: 999, overflow: "hidden" }}>
                        <span style={{ display: "block", height: "100%", width: `${c.w / 10 * 100}%`, background: "var(--pc-primary)", borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="pc-btn is-sm is-ghost" style={{ marginTop: 8, padding: 0 }}>Show 5 more</button>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginBottom: 10 }}>Difficulty target</div>
                {[
                  ["Easy",   28, "var(--pc-success)"],
                  ["Medium", 50, "var(--pc-primary)"],
                  ["Hard",   22, "var(--pc-warning)"],
                ].map(([k, v, c]) => (
                  <div key={k} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: "var(--pc-ink-2)" }}>{k}</span>
                      <span className="pc-num pc-serif" style={{ marginLeft: "auto", fontWeight: 500, fontSize: 14 }}>{v}%</span>
                    </div>
                    <div style={{ height: 6, background: "var(--pc-surface-3)", borderRadius: 999, overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: `${v}%`, background: c, borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
                <div className="pc-callout" style={{ fontSize: 11.5, color: "var(--pc-ink-3)" }}>
                  <span className="pc-serif" style={{ fontStyle: "italic" }}>2,184 matching questions in repository.</span>
                </div>
              </div>
            </div>
          </ReviewBlock>

        </div>

        {/* Right · save options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 0, height: "fit-content" }}>
          <div className="pc-panel" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Save as</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["draft",  "Save as draft",  "Only visible to you. Not yet available to teachers.", false],
                ["shared", "Publish to school", "All teachers in Class X · Maths can use this to generate papers.", true],
                ["default", "Make default for Pre-Board", "Auto-selected when generating Pre-Board papers in Class X.", false],
              ].map(([k, name, hint, sel]) => (
                <label key={k} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 9, border: "1px solid " + (sel ? "var(--pc-primary)" : "var(--pc-line)"), background: sel ? "var(--pc-primary-50)" : "var(--pc-surface)", boxShadow: sel ? "0 0 0 3px rgba(53,92,255,0.12)" : "none", cursor: "pointer", alignItems: "flex-start" }}>
                  <span style={{ width: 16, height: 16, borderRadius: 999, border: sel ? "5px solid var(--pc-primary)" : "1.5px solid var(--pc-line-2)", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>{name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginTop: 2, lineHeight: 1.4 }}>{hint}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pc-panel" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Linked templates</div>
            <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", marginBottom: 10, lineHeight: 1.5 }}>Templates control how this blueprint <em>looks</em> when printed. You can change it any time.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Academic Classic", "Default", true],
                ["Saraswati Brand",  "Custom", false],
              ].map(([t, kind, sel]) => (
                <label key={t} style={{ display: "flex", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid " + (sel ? "var(--pc-primary)" : "var(--pc-line)"), background: sel ? "var(--pc-primary-50)" : "var(--pc-surface)", alignItems: "center", cursor: "pointer" }}>
                  <span style={{ width: 14, height: 14, borderRadius: 999, border: sel ? "4px solid var(--pc-primary)" : "1.5px solid var(--pc-line-2)" }} />
                  <span style={{ fontSize: 12.5, color: "var(--pc-ink)", flex: 1 }}>{t}</span>
                  <span className="pc-tag is-outline" style={{ height: 17, fontSize: 9.5 }}>{kind}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--pc-ink)", color: "white", borderRadius: 14, padding: "16px 18px", boxShadow: "var(--pc-shadow-md)" }}>
            <div style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, opacity: 0.6 }}>Ready to publish</div>
            <div className="pc-serif" style={{ fontSize: 16, fontWeight: 500, marginTop: 4, letterSpacing: "-0.014em" }}>Pre-Board · December</div>
            <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 6, lineHeight: 1.5 }}>80m · 4 sections · 12 chapters · CBSE Class X · Maths. Teachers will see it in their Generate flow.</div>
            <button className="pc-btn is-primary is-lg" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>
              <Icon name="check" size={14} />Save & publish blueprint
            </button>
          </div>
        </div>
      </div>
    </main>
    <WizardFooter step={4} primary="Save & publish" secondary={<button className="pc-btn">Save as draft</button>} />
  </BPShell>
);

// ───────────────────────────────────────────────────────────────────────────
// Expose
// ───────────────────────────────────────────────────────────────────────────
Object.assign(window, { BPLibrary, BPDetail, BPCreate1, BPCreate2, BPCreate3, BPCreate4 });
