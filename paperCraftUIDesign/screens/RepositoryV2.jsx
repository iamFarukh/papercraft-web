// RepositoryV2.jsx — Redesigned Question Repository
// Matches the live product UI:
//   · "Smart filters" sidebar with syllabus tree (checkbox tree, not accordions)
//   · Difficulty + Question Type as pill chips, not checkbox lists
//   · 2-column question card grid (not list rows)
//   · Question Intelligence panel on the right
//   · Selection action bar appears below the topbar when ≥1 selected
//   · Question Detail modal as second artboard
//
// RBSE flavour · Classes V–VIII · 37 questions · bilingual.

const RBSE_QUESTIONS = [
  {
    id: "VII · SCI · NP · 327",
    code: "RBSE-VII-SCI-NP-327",
    cls: "VII", subj: "SCI", chap: "Photosynthesis",
    type: "True / False", lang: "EN + HI", flagNew: true,
    diff: 1, time: "1m", marks: 1,
    body: "Photosynthesis occurs only in the presence of sunlight.",
    hindi: "प्रकाश संश्लेषण केवल सूर्य की उपस्थिति में होता है।",
    bloom: "Remember",
    classLabel: "Class VII · Science · Nutrition in Plants",
    chapPill: "Photosynthesis",
    used: 0, status: "Draft", alignment: 97, quality: 75, answer: "True",
    solution: "Sunlight is essential for photosynthesis because plants use light energy to prepare food.",
  },
  {
    id: "VIII · ENG · THET · 344",
    code: "RBSE-VIII-ENG-THET-344",
    cls: "VIII", subj: "ENG", chap: "The Tsunami",
    type: "MCQ", lang: "EN + HI", flagNew: true,
    diff: 2, time: "1m", marks: 1,
    body: "What warning sign did Tilly notice before the tsunami?",
    hindi: "सुनामी आने से पहले टिली ने कौन सा चेतावनी संकेत देखा?",
    bloom: "Understand",
    classLabel: "Class VIII · English · The Tsunami",
    chapPill: "The Tsunami",
    used: 0, status: "Draft", alignment: 92, quality: 78,
  },
  {
    id: "VII · SCI · NP · 263",
    code: "RBSE-VII-SCI-NP-263",
    cls: "VII", subj: "SCI", chap: "Nutrition in Plants",
    type: "True / False", lang: "EN + HI", flagNew: true,
    diff: 1, time: "1m", marks: 1,
    body: "Photosynthesis occurs only in the presence of sunlight.",
    hindi: "प्रकाश संश्लेषण केवल सूर्य की उपस्थिति में होता है।",
    bloom: "Remember",
    classLabel: "Class VII · Science · Nutrition in Plants",
    chapPill: "Photosynthesis",
    used: 0, status: "Draft", alignment: 97, quality: 72,
  },
  {
    id: "VI · MAT · FRAC · 466",
    code: "RBSE-VI-MAT-FRAC-466",
    cls: "VI", subj: "MAT", chap: "Fractions",
    type: "Short Answer", lang: null, flagDiffPips: true,
    diff: 3, time: "2m", marks: 2,
    body: "Add: 2/5 + 1/3. Express the answer in lowest terms.",
    hindi: null,
    bloom: "Apply",
    classLabel: "Class VI · Mathematics · Fractions",
    chapPill: "Addition of Fractions",
    used: 7, status: "Archived", alignment: 89, quality: 86,
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Sidebar nav (RBSE-flavoured counts)
// ───────────────────────────────────────────────────────────────────────────
const RBSE_ADMIN_NAV = [
  { section: null, items: [
    { key: "home", label: "Control Center", icon: "home" },
    { key: "feed", label: "Activity Feed", icon: "history", badge: "12" },
  ]},
  { section: "Academic", items: [
    { key: "repo", label: "Question Repository", icon: "archive", badge: "37" },
    { key: "marks", label: "Bookmarks", icon: "star", badge: "3" },
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

// ───────────────────────────────────────────────────────────────────────────
// Smart Filters — syllabus tree with checkboxes, difficulty/type/status pills
// ───────────────────────────────────────────────────────────────────────────

const TreeCheckbox = ({ checked, indeterminate }) => (
  <span style={{
    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
    border: checked || indeterminate ? "none" : "1.5px solid var(--pc-line-2)",
    background: checked || indeterminate ? "var(--pc-primary)" : "var(--pc-surface)",
    display: "grid", placeItems: "center",
    boxShadow: checked ? "inset 0 0 0 1px rgba(255,255,255,0.3)" : "none",
  }}>
    {checked && <Icon name="check" size={9} style={{ color: "white", strokeWidth: 3 }} />}
    {indeterminate && !checked && <span style={{ width: 8, height: 2, background: "white", borderRadius: 1 }} />}
  </span>
);

const TreeRow = ({ depth = 0, expandable, expanded, checked, indeterminate, label, count }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", paddingLeft: depth * 22, cursor: "pointer", fontSize: 12.5, color: "var(--pc-ink-2)" }}>
    <span style={{ width: 14, display: "grid", placeItems: "center", color: "var(--pc-ink-4)" }}>
      {expandable
        ? <Icon name={expanded ? "chevDown" : "chev"} size={11} />
        : null}
    </span>
    <TreeCheckbox checked={checked} indeterminate={indeterminate} />
    <span style={{ flex: 1 }}>{label}</span>
    <span className="pc-num" style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{count}</span>
  </div>
);

const SmartFilters = () => (
  <aside style={{ borderRight: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "18px 18px 22px", overflow: "auto", display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
      <span className="pc-serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--pc-ink)" }}>Smart filters</span>
      <button style={{ marginLeft: "auto", background: "transparent", border: 0, color: "var(--pc-primary)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--pc-sans)" }}>Reset</button>
    </div>
    <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginBottom: 14 }}>All syllabus</div>

    {/* Search */}
    <div style={{ position: "relative", marginBottom: 14 }}>
      <Icon name="search" size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--pc-ink-4)" }} />
      <input placeholder="Search class, subject, chapter…"
        style={{ width: "100%", height: 32, padding: "0 12px 0 32px", borderRadius: 8, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", fontSize: 12, fontFamily: "var(--pc-sans)", outline: "none", boxShadow: "var(--pc-shadow-xs)" }} />
    </div>

    {/* SYLLABUS group */}
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 0", cursor: "pointer" }}>
        <Icon name="chevDown" size={11} style={{ color: "var(--pc-ink-4)" }} />
        <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pc-ink-3)" }}>Syllabus</span>
        <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-5)" }}>5 classes</span>
      </div>
      <div>
        <TreeRow expandable expanded checked label="Class V" count={4} />
        <TreeRow depth={1} expandable expanded checked label="Hindi" count={5} />
        <TreeRow depth={2} checked label="रिमझिम — भारत" count={1} />
        <TreeRow depth={1} expandable checked label="Mathematics" count={15} />
        <TreeRow expandable checked label="Class VI" count={7} />
        <TreeRow expandable checked label="Class VII" count={12} />
        <TreeRow expandable checked label="Class VIII" count={13} />
        <TreeRow expandable checked label="Class 11" count={1} />
      </div>
    </div>

    {/* DIFFICULTY group */}
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 0", cursor: "pointer" }}>
        <Icon name="chevDown" size={11} style={{ color: "var(--pc-ink-4)" }} />
        <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pc-ink-3)" }}>Difficulty</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {[
          { label: "Easy",   count: 14, color: "var(--pc-success)", active: true },
          { label: "Medium", count: 17, color: "var(--pc-primary)", active: true },
          { label: "Hard",   count: 6,  color: "var(--pc-warning)", active: true },
        ].map(p => (
          <div key={p.label} style={{
            height: 28, padding: "0 10px",
            border: "1px solid " + (p.active ? "var(--pc-primary-200)" : "var(--pc-line)"),
            background: p.active ? "var(--pc-primary-50)" : "var(--pc-surface)",
            borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6,
            cursor: "pointer",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: p.color }} />
            <span style={{ fontSize: 12, color: p.active ? "var(--pc-primary-ink)" : "var(--pc-ink-2)", fontWeight: 500 }}>{p.label}</span>
            <span className="pc-num" style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{p.count}</span>
          </div>
        ))}
      </div>
    </div>

    {/* QUESTION TYPE group */}
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 0", cursor: "pointer" }}>
        <Icon name="chevDown" size={11} style={{ color: "var(--pc-ink-4)" }} />
        <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pc-ink-3)" }}>Question type</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {[
          { label: "MCQ", count: 12, active: true },
          { label: "Short Answer", count: 9, active: true },
          { label: "Long Answer", count: 7, active: false },
          { label: "True / False", count: 6, active: true },
          { label: "Fill", count: 3, active: false },
        ].map(p => (
          <div key={p.label} style={{
            height: 28, padding: "0 10px",
            border: "1px solid " + (p.active ? "var(--pc-primary-200)" : "var(--pc-line)"),
            background: p.active ? "var(--pc-primary-50)" : "var(--pc-surface)",
            borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6,
            cursor: "pointer",
          }}>
            <span style={{ fontSize: 12, color: p.active ? "var(--pc-primary-ink)" : "var(--pc-ink-2)", fontWeight: 500 }}>{p.label}</span>
            <span className="pc-num" style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{p.count}</span>
          </div>
        ))}
      </div>
    </div>

    {/* STATUS group */}
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 0", cursor: "pointer" }}>
        <Icon name="chevDown" size={11} style={{ color: "var(--pc-ink-4)" }} />
        <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pc-ink-3)" }}>Status</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {[
          { label: "Draft",     count: 21, color: "var(--pc-warning)", active: true },
          { label: "Published", count: 12, color: "var(--pc-success)", active: false },
          { label: "Archived",  count: 4,  color: "var(--pc-ink-4)",    active: false },
          { label: "Locked",    count: 0,  color: "var(--pc-ink-4)",    active: false },
        ].map(p => (
          <div key={p.label} style={{
            height: 28, padding: "0 10px",
            border: "1px solid " + (p.active ? "var(--pc-primary-200)" : "var(--pc-line)"),
            background: p.active ? "var(--pc-primary-50)" : "var(--pc-surface)",
            borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6,
            cursor: "pointer",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: p.color }} />
            <span style={{ fontSize: 12, color: p.active ? "var(--pc-primary-ink)" : "var(--pc-ink-2)", fontWeight: 500 }}>{p.label}</span>
            <span className="pc-num" style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{p.count}</span>
          </div>
        ))}
      </div>
    </div>

    {/* LANGUAGE group */}
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 0", cursor: "pointer" }}>
        <Icon name="chevDown" size={11} style={{ color: "var(--pc-ink-4)" }} />
        <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pc-ink-3)" }}>Language</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {[
          { label: "EN + HI", count: 22, active: true },
          { label: "EN only", count: 10, active: false },
          { label: "HI only", count: 5, active: false },
        ].map(p => (
          <div key={p.label} style={{
            height: 28, padding: "0 10px",
            border: "1px solid " + (p.active ? "var(--pc-primary-200)" : "var(--pc-line)"),
            background: p.active ? "var(--pc-primary-50)" : "var(--pc-surface)",
            borderRadius: 999, display: "inline-flex", alignItems: "center",
            cursor: "pointer",
          }}>
            <span style={{ fontSize: 12, color: p.active ? "var(--pc-primary-ink)" : "var(--pc-ink-2)", fontWeight: 500 }}>{p.label}</span>
            <span className="pc-num" style={{ fontSize: 11, color: "var(--pc-ink-4)", marginLeft: 6 }}>{p.count}</span>
          </div>
        ))}
      </div>
    </div>
  </aside>
);

// ───────────────────────────────────────────────────────────────────────────
// Question card — matches the live-product card style
// ───────────────────────────────────────────────────────────────────────────

const QCardV2 = ({ q, selected }) => (
  <article style={{
    background: "var(--pc-surface)",
    border: "1px solid " + (selected ? "var(--pc-primary)" : "var(--pc-line)"),
    borderRadius: 12,
    boxShadow: selected ? "0 0 0 3px rgba(53,92,255,0.12), var(--pc-shadow-xs)" : "var(--pc-shadow-xs)",
    padding: "14px 16px 14px",
    cursor: "pointer",
    display: "flex", flexDirection: "column",
    minHeight: 240,
  }}>
    {/* Top row: ID, type, lang, new, star, kebab */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="pc-mono" style={{ fontSize: 10.5, color: "var(--pc-ink-3)", fontWeight: 500 }}>{q.id}</span>
      <span className="pc-tag is-ink" style={{ height: 20, fontSize: 10.5 }}>{q.type}</span>
      {q.lang && <span className="pc-tag is-outline" style={{ height: 20, fontSize: 10.5 }}>{q.lang}</span>}
      {q.flagNew && <span className="pc-tag is-success" style={{ height: 20, fontSize: 10.5 }}>new</span>}
      {q.flagDiffPips && <Difficulty level={q.diff} />}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
        <button style={{ width: 24, height: 24, border: 0, background: "transparent", color: "var(--pc-ink-4)", cursor: "pointer", display: "grid", placeItems: "center", borderRadius: 5 }}><Icon name="star" size={13} /></button>
        <button style={{ width: 24, height: 24, border: 0, background: "transparent", color: "var(--pc-ink-4)", cursor: "pointer", display: "grid", placeItems: "center", borderRadius: 5 }}><Icon name="chevDown" size={12} /></button>
        <button style={{ width: 24, height: 24, border: 0, background: "transparent", color: "var(--pc-ink-4)", cursor: "pointer", display: "grid", placeItems: "center", borderRadius: 5 }}><Icon name="dots" size={13} /></button>
      </div>
    </div>

    {/* Difficulty pips + time */}
    {!q.flagDiffPips && (
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10 }}>
        <Difficulty level={q.diff} />
        <span className="pc-tag" style={{ height: 22, fontSize: 11, background: "var(--pc-surface-3)" }}>{q.time}</span>
      </div>
    )}

    {/* Body */}
    <div className="pc-serif" style={{ fontSize: 16, lineHeight: 1.5, color: "var(--pc-ink)", marginTop: 14, letterSpacing: "-0.01em" }}>
      {q.body}
    </div>
    {q.hindi && (
      <div className="pc-serif" style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--pc-ink-3)", marginTop: 8 }}>
        {q.hindi}
      </div>
    )}

    {/* Footer */}
    <div style={{ marginTop: "auto", paddingTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, color: "var(--pc-ink-4)", flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.classLabel}</span>
      <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>Used <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{q.used}×</span></span>
      <span className={"pc-tag " + (q.status === "Draft" ? "is-warning" : q.status === "Archived" ? "" : "is-success")} style={{ height: 20, fontSize: 10.5 }}>{q.status}</span>
      <span className="pc-tag is-outline" style={{ height: 20, fontSize: 10.5 }}>{q.chapPill}</span>
    </div>
    <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--pc-success)", textAlign: "right", letterSpacing: "0.02em" }}>RBSE aligned</div>
  </article>
);

// ───────────────────────────────────────────────────────────────────────────
// Question Intelligence right panel
// ───────────────────────────────────────────────────────────────────────────

const IntelligencePanel = ({ q }) => (
  <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "20px 22px 22px", overflow: "auto", display: "flex", flexDirection: "column" }}>
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
      <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Question Intelligence</span>
      <span className="pc-mono" style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)" }}>{q.id}</span>
    </div>
    <h2 className="pc-serif" style={{ fontSize: 22, fontWeight: 500, margin: "2px 0 4px", letterSpacing: "-0.022em", color: "var(--pc-ink)" }}>{q.chap}</h2>
    <div style={{ fontSize: 12, color: "var(--pc-ink-3)", marginBottom: 18 }}>Class {q.cls} · {q.subj === "SCI" ? "Science" : q.subj === "ENG" ? "English" : "Mathematics"} · {q.chap}</div>

    {/* Quality + alignment */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
      <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)" }}>
        <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Quality</div>
        <div className="pc-serif pc-num" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, marginTop: 4, letterSpacing: "-0.02em" }}>{q.quality}</div>
      </div>
      <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)" }}>
        <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>RBSE alignment</div>
        <div className="pc-serif pc-num" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, marginTop: 4, letterSpacing: "-0.02em" }}>{q.alignment}<span style={{ fontSize: 14, color: "var(--pc-ink-4)" }}>%</span></div>
      </div>
    </div>

    {/* Metadata */}
    <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Metadata</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
      {[
        ["Type", q.type],
        ["Difficulty", ["Easy", "Easy", "Medium", "Hard"][q.diff - 1]],
        ["Bloom level", q.bloom?.toLowerCase() || "remember"],
        ["Marks", String(q.marks)],
      ].map(([k, v]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, padding: "5px 0", borderBottom: "1px dashed var(--pc-line)" }}>
          <span style={{ color: "var(--pc-ink-3)" }}>{k}</span>
          <span style={{ color: "var(--pc-ink)", fontWeight: 500 }}>{v}</span>
        </div>
      ))}
    </div>

    {/* Lifecycle */}
    <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Lifecycle</div>
    <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, boxShadow: "var(--pc-shadow-xs)", marginBottom: 16 }}>
      {[
        ["Status", <span className="pc-tag is-warning" style={{ height: 20, fontSize: 10.5 }}>{q.status}</span>],
        ["Last used", <span style={{ color: "var(--pc-ink-4)" }}>—</span>],
        ["Usage count", <span className="pc-num">{q.used}×</span>],
      ].map(([k, v], i) => (
        <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i === 2 ? "none" : "1px solid var(--pc-line)", fontSize: 12.5 }}>
          <span style={{ color: "var(--pc-ink-3)" }}>{k}</span>
          <span style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{v}</span>
        </div>
      ))}
    </div>

    {/* Usage insights */}
    <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Usage insights</div>
    <div style={{ background: "linear-gradient(180deg, #F1F4FF, #E7ECFF)", border: "1px solid #C9D4FF", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-primary-ink)", marginBottom: 4 }}>Exam exposure</div>
      <div style={{ fontSize: 11.5, color: "#3F4F8C", lineHeight: 1.5 }}>
        Appeared in <strong style={{ fontWeight: 500 }}>6 generated papers</strong> this term. Under-used — strong candidate for practice sets.
      </div>
    </div>
  </aside>
);

// ───────────────────────────────────────────────────────────────────────────
// Header + selection action bar
// ───────────────────────────────────────────────────────────────────────────

const SelectionBar = () => (
  <div style={{
    background: "var(--pc-primary-50)",
    borderTop: "1px solid #C9D4FF",
    borderBottom: "1px solid #C9D4FF",
    padding: "10px 28px",
    display: "flex", alignItems: "center", gap: 4,
  }}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 14px 0 4px", height: 30, borderRadius: 8 }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--pc-primary)", color: "white", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 500 }} className="pc-num">1</span>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-primary-ink)" }}>selected</span>
    </span>
    <span style={{ width: 1, height: 18, background: "#C9D4FF", margin: "0 6px" }} />
    {[
      { icon: "play", label: "Publish" },
      { icon: "archive", label: "Archive" },
      { icon: "lock", label: "Lock" },
    ].map(a => (
      <button key={a.label} style={{
        background: "transparent", border: 0, padding: "0 10px", height: 28, borderRadius: 7,
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 12.5, color: "var(--pc-ink-2)", cursor: "pointer", fontFamily: "var(--pc-sans)",
      }}>
        <Icon name={a.icon} size={13} style={{ color: "var(--pc-ink-3)" }} />{a.label}
      </button>
    ))}
    <button style={{
      background: "var(--pc-danger-bg)", border: "1px solid #F0C3BC", padding: "0 12px", height: 28, borderRadius: 7,
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 12.5, color: "var(--pc-danger)", fontWeight: 500, cursor: "pointer", fontFamily: "var(--pc-sans)", marginLeft: 4,
    }}>
      <Icon name="archive" size={13} />Delete
    </button>
    <button style={{ marginLeft: "auto", width: 28, height: 28, border: 0, background: "transparent", color: "var(--pc-ink-4)", cursor: "pointer", display: "grid", placeItems: "center", borderRadius: 7 }}>
      <Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} />
    </button>
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
// Main screen
// ───────────────────────────────────────────────────────────────────────────

const RepositoryV2 = ({ withModal }) => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="repo" items={RBSE_ADMIN_NAV}
        footName="test" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar
          crumbs={["Academic", "Question Repository", "RBSE · Classes V–VIII"]}
          actions={<button className="pc-btn is-primary"><Icon name="plus" size={14} />New Question</button>}
        />

        {/* Page header */}
        <div style={{ padding: "22px 28px 14px", background: "var(--pc-bg)", borderBottom: "1px solid var(--pc-line)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 6 }}>The Repository · RBSE</div>
              <h1 className="pc-serif" style={{ fontSize: 30, fontWeight: 500, margin: 0, letterSpacing: "-0.028em", lineHeight: 1.05 }}>
                37 questions <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>Classes V–VIII</span>
              </h1>
              <button style={{
                marginTop: 12, padding: "5px 14px", height: 28, borderRadius: 999,
                border: "1px solid var(--pc-primary)", background: "var(--pc-primary-50)",
                color: "var(--pc-primary-ink)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--pc-sans)",
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>All filters</button>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", textAlign: "right" }}>
              <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>32</span> in current view
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: "14px 28px 14px", background: "var(--pc-bg)", borderBottom: "1px solid var(--pc-line)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flex: "0 0 360px" }}>
            <Icon name="search" size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--pc-ink-4)" }} />
            <input placeholder="Search questions, chapters, IDs…"
              style={{ width: "100%", height: 32, padding: "0 36px 0 32px", borderRadius: 8, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", fontSize: 12.5, fontFamily: "var(--pc-sans)", outline: "none", boxShadow: "var(--pc-shadow-xs)" }} />
            <kbd style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--pc-mono)", fontSize: 10.5, padding: "2px 6px", background: "var(--pc-surface-3)", border: "1px solid var(--pc-line)", borderRadius: 4, color: "var(--pc-ink-3)" }}>⌘K</kbd>
          </div>

          {/* Sort */}
          <button className="pc-btn"><Icon name="sliders" size={12} />Sort: Recent<Icon name="chevDown" size={11} /></button>

          {/* Grid/List toggle — proper segmented control */}
          <div style={{ display: "inline-flex", background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 8, padding: 2, boxShadow: "var(--pc-shadow-xs)" }}>
            <button style={{
              height: 28, padding: "0 11px", borderRadius: 6, border: 0, cursor: "pointer", fontFamily: "var(--pc-sans)",
              background: "var(--pc-surface-3)", color: "var(--pc-ink)", fontSize: 12, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}><Icon name="grid" size={13} />Grid</button>
            <button style={{
              height: 28, padding: "0 11px", borderRadius: 6, border: 0, cursor: "pointer", fontFamily: "var(--pc-sans)",
              background: "transparent", color: "var(--pc-ink-4)", fontSize: 12, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}><Icon name="list" size={13} />List</button>
          </div>

          <span style={{ fontSize: 12, color: "var(--pc-ink-4)", marginLeft: 4 }}>
            <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>32</span> matches
          </span>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="pc-btn"><Icon name="filter" size={12} />Filters</button>
            <button className="pc-btn"><Icon name="archive" size={12} />Trash<span className="pc-num" style={{ marginLeft: 4, color: "var(--pc-ink-4)" }}>5</span></button>
            <button className="pc-btn"><Icon name="upload" size={13} />Import</button>
            <button className="pc-btn is-primary"><Icon name="plus" size={13} />New Question</button>
          </div>
        </div>

        <SelectionBar />

        {/* Main 3-column body */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 340px", flex: 1, minHeight: 0, background: "var(--pc-bg)" }}>
          <SmartFilters />

          {/* Center — question grid */}
          <section className="pc-scroll" style={{ overflow: "auto", padding: "16px 22px 28px" }}>
            <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginBottom: 12 }}>Showing <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>32</span> questions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {RBSE_QUESTIONS.map((q, i) => (
                <QCardV2 key={q.id} q={q} selected={i === 0} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
              <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
              <button className="pc-btn is-sm">Load 24 more</button>
              <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
            </div>
          </section>

          <IntelligencePanel q={RBSE_QUESTIONS[0]} />
        </div>
      </div>
    </div>

    {/* Optional Question Detail modal overlay */}
    {withModal && <QuestionDetailModal q={RBSE_QUESTIONS[0]} />}
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
// Question Detail Modal
// ───────────────────────────────────────────────────────────────────────────

const QuestionDetailModal = ({ q }) => (
  <div style={{
    position: "absolute", inset: 0,
    background: "rgba(20,22,26,0.42)",
    backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
    display: "grid", placeItems: "center", zIndex: 20,
  }}>
    <div style={{
      width: 720, maxHeight: "94%", overflow: "auto",
      background: "var(--pc-surface)",
      borderRadius: 16, boxShadow: "var(--pc-shadow-lg)",
      border: "1px solid var(--pc-line)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid var(--pc-line)", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Question detail</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span className="pc-tag is-warning" style={{ height: 22, fontSize: 11 }}>{q.status}</span>
            <span className="pc-tag is-ink" style={{ height: 22, fontSize: 11 }}>{q.type}</span>
          </div>
          <div className="pc-mono" style={{ fontSize: 13, color: "var(--pc-ink-2)", fontWeight: 500 }}>{q.id}</div>
          <div className="pc-mono" style={{ fontSize: 11, color: "var(--pc-ink-4)", marginTop: 2 }}>{q.code}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="pc-icon-btn"><Icon name="star" size={14} /></button>
          <button className="pc-icon-btn"><Icon name="edit" size={14} /></button>
          <button className="pc-icon-btn"><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: "18px 24px" }}>
        <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Question</div>
        <div style={{ background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", borderRadius: 10, padding: "18px 20px" }}>
          <div className="pc-serif" style={{ fontSize: 16.5, lineHeight: 1.5, color: "var(--pc-ink)", letterSpacing: "-0.01em" }}>{q.body}</div>
          <div className="pc-serif" style={{ fontSize: 14, lineHeight: 1.55, color: "var(--pc-ink-3)", marginTop: 10 }}>{q.hindi}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <span style={{ fontSize: 12 }}><span className="pc-num" style={{ fontWeight: 500 }}>{q.marks}</span> marks</span>
          <Difficulty level={q.diff} />
          <span style={{ fontSize: 12, color: "var(--pc-ink-3)" }}>Easy</span>
          <span className="pc-tag" style={{ height: 22 }}>Bilingual</span>
        </div>
      </div>

      {/* Answer & solution */}
      <div style={{ padding: "10px 24px 20px", borderTop: "1px dashed var(--pc-line)" }}>
        <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 12 }}>Answer &amp; solution</div>
        <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Answer</div>
        <div className="pc-serif" style={{ fontSize: 16, color: "var(--pc-ink)", fontWeight: 500, marginBottom: 14 }}>{q.answer}</div>
        <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Solution</div>
        <div style={{ fontSize: 13, color: "var(--pc-ink-2)", lineHeight: 1.55 }}>{q.solution}</div>
      </div>

      {/* Meta + usage two-col */}
      <div style={{ padding: "14px 24px 18px", borderTop: "1px solid var(--pc-line)", background: "var(--pc-surface-2)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Metadata</div>
            {[
              ["Class", "Class VII"],
              ["Subject", "Science"],
              ["Chapter", q.chap],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12.5 }}>
                <span style={{ color: "var(--pc-ink-3)" }}>{k}</span>
                <span style={{ color: "var(--pc-ink)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Usage insights</div>
            {[
              ["file", "Used in ", <strong style={{ fontWeight: 500 }}>0 papers</strong>],
              ["clock", "Last used · ", <span style={{ color: "var(--pc-ink-4)" }}>—</span>],
              ["target", "Syllabus alignment · ", <strong style={{ fontWeight: 500 }}>{q.alignment}%</strong>],
            ].map(([icon, label, val], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12.5, color: "var(--pc-ink-3)" }}>
                <Icon name={icon} size={13} style={{ color: "var(--pc-ink-4)" }} />
                <span>{label}{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ padding: "12px 24px 20px", borderTop: "1px solid var(--pc-line)" }}>
        <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", marginBottom: 10, textAlign: "center" }}>
          Not visible to teachers. Still being authored or reviewed.
        </div>
        <button className="pc-btn is-primary is-lg" style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
          <Icon name="play" size={14} />Publish
        </button>
        <button style={{
          width: "100%", height: 38, borderRadius: 9, padding: "0 16px",
          background: "var(--pc-danger-bg)", border: "1px solid #F0C3BC",
          color: "var(--pc-danger)", fontWeight: 500, fontSize: 13, fontFamily: "var(--pc-sans)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
          cursor: "pointer", marginBottom: 8,
        }}>
          <Icon name="archive" size={14} />Archive Question
        </button>
        <button style={{
          width: "100%", height: 38, borderRadius: 9, padding: "0 16px",
          background: "var(--pc-danger-bg)", border: "1px solid #F0C3BC",
          color: "var(--pc-danger)", fontWeight: 500, fontSize: 13, fontFamily: "var(--pc-sans)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
          cursor: "pointer",
        }}>
          <Icon name="archive" size={14} />Move to trash
        </button>
      </div>
    </div>
  </div>
);

Object.assign(window, { RepositoryV2, QuestionDetailModal });
