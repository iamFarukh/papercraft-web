// Repository.jsx — Admin Question Repository Workspace
// Editorial three-column layout: filters · question stream · intelligence panel.
// Live filter/search interaction with state.

const QUESTION_BANK = [
  {
    id: "Q-2841", chapter: "Quadratic Equations", topic: "Nature of Roots",
    type: "Short Answer", marks: 3, difficulty: 3, bloom: "Apply", lang: "EN+HI",
    usage: 4, lastUsed: "Half-Yearly · 2024", alignment: 96, quality: 88, status: "Approved",
    body: (
      <>If the roots of the quadratic equation <span className="pc-math">(b – c)x<span className="pc-sup">2</span> + (c – a)x + (a – b) = 0</span> are equal, prove that <span className="pc-math">2b = a + c</span>.</>
    ),
    hindi: "यदि द्विघात समीकरण (b – c)x² + (c – a)x + (a – b) = 0 के मूल समान हैं तो सिद्ध कीजिए कि 2b = a + c.",
    flags: [],
  },
  {
    id: "Q-2842", chapter: "Trigonometry", topic: "Identities",
    type: "Long Answer", marks: 5, difficulty: 4, bloom: "Analyze", lang: "EN",
    usage: 2, lastUsed: "Pre-Board · 2024", alignment: 92, quality: 94, status: "Approved",
    body: (
      <>Prove that <span className="pc-math"><span className="pc-frac"><span>sin θ – cos θ + 1</span><span>sin θ + cos θ – 1</span></span> = <span className="pc-frac"><span>1</span><span>sec θ – tan θ</span></span></span>, using the identity sec<span className="pc-sup">2</span> θ = 1 + tan<span className="pc-sup">2</span> θ.</>
    ),
    flags: ["HOTS"],
  },
  {
    id: "Q-2843", chapter: "Quadratic Equations", topic: "Word Problems",
    type: "Long Answer", marks: 4, difficulty: 3, bloom: "Apply", lang: "EN+HI",
    usage: 7, lastUsed: "Mid-Term · 2025", alignment: 88, quality: 76, status: "Approved",
    body: (
      <>A train, travelling at a uniform speed for 360 km, would have taken 48 minutes less to travel the same distance if its speed were 5 km/h more. Find the original speed of the train.</>
    ),
    flags: ["high-use"],
  },
  {
    id: "Q-2844", chapter: "Real Numbers", topic: "Euclid's Lemma",
    type: "MCQ", marks: 1, difficulty: 2, bloom: "Understand", lang: "EN+HI",
    usage: 12, lastUsed: "Unit Test · 2025", alignment: 100, quality: 70, status: "Approved",
    body: (
      <>The HCF of <span className="pc-math">96</span> and <span className="pc-math">404</span> by the Euclidean algorithm is —
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 18px", marginTop: 8, fontSize: 12.5, color: "var(--pc-ink-2)" }}>
          <div>(a)&nbsp; 2</div><div>(b)&nbsp; 4</div>
          <div>(c)&nbsp; 8</div><div>(d)&nbsp; 16</div>
        </div></>
    ),
    flags: ["over-used"],
  },
  {
    id: "Q-2845", chapter: "Arithmetic Progressions", topic: "n-th Term",
    type: "Short Answer", marks: 2, difficulty: 2, bloom: "Apply", lang: "EN",
    usage: 1, lastUsed: "—", alignment: 94, quality: 82, status: "Draft",
    body: (
      <>Find the <span className="pc-math">11<span className="pc-sup">th</span></span> term of the A.P. <span className="pc-math">–27, –22, –17, –12, …</span> using the standard formula <span className="pc-math">a<span className="pc-sub">n</span> = a + (n – 1)d</span>.</>
    ),
    flags: ["new"],
  },
];

const FilterGroup = ({ label, children, count, defaultOpen = true }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--pc-line)", padding: "12px 0" }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: "transparent", border: 0, padding: 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--pc-ink-2)", cursor: "pointer" }}>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label} {count && <span style={{ color: "var(--pc-ink-5)", fontWeight: 400 }}>· {count}</span>}</span>
        <Icon name={open ? "minus" : "plus"} size={12} />
      </button>
      {open && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>
  );
};

const FilterCheck = ({ label, count, checked, onChange, color }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 0", cursor: "pointer", fontSize: 12.5, color: "var(--pc-ink-2)" }}>
    <span style={{ width: 14, height: 14, borderRadius: 4, border: checked ? "none" : "1px solid var(--pc-line-2)", background: checked ? "var(--pc-primary)" : "var(--pc-surface)", display: "grid", placeItems: "center", flexShrink: 0, transition: "all .15s", boxShadow: checked ? "inset 0 0 0 1px rgba(255,255,255,0.3)" : "none" }}>
      {checked && <Icon name="check" size={9} style={{ color: "white", strokeWidth: 3 }} />}
    </span>
    {color && <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />}
    <span style={{ flex: 1 }}>{label}</span>
    <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }} className="pc-num">{count}</span>
  </label>
);

const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    height: 24, padding: "0 9px",
    border: "1px solid " + (active ? "var(--pc-primary)" : "var(--pc-line)"),
    background: active ? "var(--pc-primary-50)" : "var(--pc-surface)",
    color: active ? "var(--pc-primary-ink)" : "var(--pc-ink-2)",
    borderRadius: 999, fontSize: 11.5, fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--pc-sans)",
  }}>{label}</button>
);

const QuestionCard = ({ q, selected, onSelect }) => (
  <article onClick={onSelect} style={{
    background: "var(--pc-surface)",
    border: "1px solid " + (selected ? "var(--pc-primary)" : "var(--pc-line)"),
    borderRadius: "var(--pc-r-md)",
    padding: "16px 18px",
    boxShadow: selected ? "0 0 0 3px rgba(53,92,255,0.12), var(--pc-shadow-sm)" : "var(--pc-shadow-xs)",
    cursor: "pointer",
    position: "relative",
    transition: "all .15s",
  }}>
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span className="pc-mono" style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{q.id}</span>
      <span style={{ width: 1, height: 11, background: "var(--pc-line-2)" }} />
      <span className="pc-tag is-outline">{q.chapter}</span>
      <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>→ {q.topic}</span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {q.flags.map(f => (
          <span key={f} className={"pc-tag " + (f === "HOTS" ? "is-danger" : f === "high-use" ? "is-warning" : f === "over-used" ? "is-danger" : "is-success")}>{f}</span>
        ))}
        <button style={{ background: "transparent", border: 0, color: "var(--pc-ink-4)", cursor: "pointer", padding: 2 }}><Icon name="star" size={14} /></button>
        <button style={{ background: "transparent", border: 0, color: "var(--pc-ink-4)", cursor: "pointer", padding: 2 }}><Icon name="dots" size={14} /></button>
      </div>
    </div>
    {/* Body */}
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="pc-serif" style={{ fontSize: 15.5, lineHeight: 1.55, color: "var(--pc-ink)", margin: 0, fontWeight: 400, letterSpacing: "-0.005em" }}>
          {q.body}
        </div>
        {q.hindi && (
          <div style={{ fontSize: 13, color: "var(--pc-ink-3)", margin: "8px 0 0", fontStyle: "normal", lineHeight: 1.55 }} className="pc-serif">
            {q.hindi}
          </div>
        )}
      </div>
    </div>
    {/* Footer */}
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--pc-line)" }}>
      <span className="pc-tag is-ink">{q.type}</span>
      <span style={{ fontSize: 11.5, color: "var(--pc-ink-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
        <span className="pc-num" style={{ fontWeight: 500, color: "var(--pc-ink-2)" }}>{q.marks}</span> marks
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Difficulty level={q.difficulty} />
      </span>
      <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Bloom · {q.bloom}</span>
      <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>{q.lang}</span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 11, color: "var(--pc-ink-4)", display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Icon name="refresh" size={11} /> used <span className="pc-num">{q.usage}×</span>
        </span>
        <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>last · {q.lastUsed}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: "var(--pc-surface-3)", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: q.quality + "%", background: q.quality >= 85 ? "var(--pc-success)" : q.quality >= 70 ? "var(--pc-primary)" : "var(--pc-warning)" }} />
          </span>
          <span style={{ fontSize: 10.5, color: "var(--pc-ink-3)" }} className="pc-num">{q.quality}</span>
        </span>
      </div>
    </div>
  </article>
);

const Repository = () => {
  const [filters, setFilters] = React.useState({
    classes: { "X": true },
    subjects: { "Mathematics": true },
    chapters: { "Quadratic Equations": true, "Trigonometry": true, "Real Numbers": true, "AP": true },
    difficulty: { easy: true, medium: true, hard: true },
    types: { mcq: true, short: true, long: true },
  });
  const [query, setQuery] = React.useState("");
  const [view, setView] = React.useState("card");
  const [selected, setSelected] = React.useState("Q-2842");

  const toggle = (group, key) => setFilters(f => ({ ...f, [group]: { ...f[group], [key]: !f[group][key] } }));

  const sel = QUESTION_BANK.find(q => q.id === selected);

  return (
    <div className="pc-screen">
      <div className="pc-shell">
        <Sidebar role="admin" active="repo" items={ADMIN_NAV}
          footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
        <div className="pc-work">
          <Topbar
            crumbs={["Academic", "Question Repository", "Mathematics · Class X"]}
            actions={<>
              <button className="pc-btn"><Icon name="upload" size={14} />Bulk Upload</button>
              <button className="pc-btn is-primary"><Icon name="plus" size={14} />New Question</button>
            </>}
          />
          {/* Sub-header */}
          <div style={{ padding: "20px 28px 14px", background: "var(--pc-bg)", borderBottom: "1px solid var(--pc-line)" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>The Repository</div>
                <h1 className="pc-serif" style={{ fontSize: 28, fontWeight: 500, margin: 0, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
                  3,412 questions <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>across 14 subjects</span>
                </h1>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>
                  <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>248</span> match current filters
                </div>
                <div style={{ display: "flex", background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 8, padding: 2, boxShadow: "var(--pc-shadow-xs)" }}>
                  <button onClick={() => setView("card")} style={{ width: 28, height: 26, borderRadius: 6, border: 0, background: view === "card" ? "var(--pc-surface-3)" : "transparent", color: view === "card" ? "var(--pc-ink)" : "var(--pc-ink-4)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="grid" size={13} /></button>
                  <button onClick={() => setView("list")} style={{ width: 28, height: 26, borderRadius: 6, border: 0, background: view === "list" ? "var(--pc-surface-3)" : "transparent", color: view === "list" ? "var(--pc-ink)" : "var(--pc-ink-4)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="list" size={13} /></button>
                </div>
              </div>
            </div>
            {/* Active filter chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
              <FilterChip label="Class X" active />
              <FilterChip label="Mathematics" active />
              <FilterChip label="Quadratic Eq. + 3" active />
              <FilterChip label="Difficulty: Med · Hard" active />
              <FilterChip label="EN + HI" active />
              <span style={{ width: 1, background: "var(--pc-line)", margin: "0 4px" }} />
              <FilterChip label="+ Bloom: Apply" />
              <FilterChip label="+ Marks: 3–5" />
              <button className="pc-btn is-sm is-ghost" style={{ marginLeft: "auto" }}>Save view <Icon name="chev" size={11} /></button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", flex: 1, minHeight: 0, background: "var(--pc-bg)" }}>
            {/* LEFT — Filters */}
            <aside style={{ borderRight: "1px solid var(--pc-line)", padding: "16px 18px", overflow: "auto", background: "var(--pc-surface-2)" }}>
              <div style={{ position: "relative", marginBottom: 4 }}>
                <Icon name="search" size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--pc-ink-4)" }} />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search filters…"
                  style={{ width: "100%", height: 30, padding: "0 10px 0 30px", borderRadius: 7, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", fontSize: 12, fontFamily: "var(--pc-sans)", outline: "none" }} />
              </div>
              <FilterGroup label="Class">
                {["VI","VII","VIII","IX","X","XI","XII"].map(c => (
                  <FilterCheck key={c} label={"Class " + c} count={[210,224,318,402,512,488,432]["VI VII VIII IX X XI XII".split(" ").indexOf(c)]} checked={!!filters.classes[c]} onChange={() => toggle("classes", c)} />
                ))}
              </FilterGroup>
              <FilterGroup label="Subject">
                {["Mathematics","Physics","Chemistry","Biology","English","Hindi","Social Studies"].map(s => (
                  <FilterCheck key={s} label={s} count={[612,388,264,302,418,294,378][["Mathematics","Physics","Chemistry","Biology","English","Hindi","Social Studies"].indexOf(s)]} checked={!!filters.subjects[s]} onChange={() => toggle("subjects", s)} />
                ))}
              </FilterGroup>
              <FilterGroup label="Chapter" count="14">
                {[
                  ["Real Numbers", 48],
                  ["Polynomials", 36],
                  ["Quadratic Equations", 29],
                  ["AP", 24],
                  ["Trigonometry", 22],
                  ["Coordinate Geometry", 14],
                  ["Statistics", 8],
                ].map(([c, n]) => (
                  <FilterCheck key={c} label={c} count={n} checked={!!filters.chapters[c.split(" ")[0] === "Coordinate" ? "Coord" : c]} onChange={() => toggle("chapters", c)} />
                ))}
              </FilterGroup>
              <FilterGroup label="Difficulty">
                <FilterCheck label="Easy" count={86} color="#14B87A" checked={filters.difficulty.easy} onChange={() => toggle("difficulty", "easy")} />
                <FilterCheck label="Medium" count={108} color="#355CFF" checked={filters.difficulty.medium} onChange={() => toggle("difficulty", "medium")} />
                <FilterCheck label="Hard" count={42} color="#E08A1F" checked={filters.difficulty.hard} onChange={() => toggle("difficulty", "hard")} />
                <FilterCheck label="HOTS" count={12} color="#DC4A3D" checked={false} onChange={() => {}} />
              </FilterGroup>
              <FilterGroup label="Question Type">
                <FilterCheck label="MCQ" count={142} checked={filters.types.mcq} onChange={() => toggle("types", "mcq")} />
                <FilterCheck label="Very Short" count={56} checked={false} onChange={() => {}} />
                <FilterCheck label="Short Answer" count={84} checked={filters.types.short} onChange={() => toggle("types", "short")} />
                <FilterCheck label="Long Answer" count={48} checked={filters.types.long} onChange={() => toggle("types", "long")} />
                <FilterCheck label="Case-Based" count={18} checked={false} onChange={() => {}} />
              </FilterGroup>
              <FilterGroup label="Bloom's Level" defaultOpen={false}>
                <FilterCheck label="Remember" count={62} checked={false} onChange={() => {}} />
                <FilterCheck label="Understand" count={88} checked={false} onChange={() => {}} />
                <FilterCheck label="Apply" count={104} checked={true} onChange={() => {}} />
              </FilterGroup>
              <FilterGroup label="Status" defaultOpen={false}>
                <FilterCheck label="Approved" count={228} checked={true} onChange={() => {}} />
                <FilterCheck label="Draft" count={14} checked={false} onChange={() => {}} />
                <FilterCheck label="Locked" count={6} checked={false} onChange={() => {}} />
              </FilterGroup>
            </aside>

            {/* CENTER — Question stream */}
            <section className="pc-scroll" style={{ padding: "18px 22px 28px", overflow: "auto" }}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <h3 className="pc-serif" style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "var(--pc-ink-3)", letterSpacing: 0 }}>
                  Quadratic Equations · 29 questions
                </h3>
                <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
                <button className="pc-btn is-sm is-ghost"><Icon name="sliders" size={11} />Sort: Recent</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {QUESTION_BANK.map(q => (
                  <QuestionCard key={q.id} q={q} selected={selected === q.id} onSelect={() => setSelected(q.id)} />
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
                <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
                <button className="pc-btn is-sm">Load 24 more</button>
                <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
              </div>
            </section>

            {/* RIGHT — Intelligence */}
            <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "18px 18px 22px", overflow: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Question Intelligence</div>
                <span className="pc-mono" style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{sel?.id}</span>
              </div>
              <h3 className="pc-serif" style={{ fontSize: 17, fontWeight: 500, margin: "4px 0 14px", letterSpacing: "-0.015em", lineHeight: 1.25 }}>
                Selected · <span style={{ color: "var(--pc-ink-3)", fontStyle: "italic" }}>{sel?.chapter} → {sel?.topic}</span>
              </h3>

              {/* Quality circle */}
              <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12, padding: 14, boxShadow: "var(--pc-shadow-xs)", display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                <div className="pc-radial" style={{ "--p": sel?.quality }}><span>{sel?.quality}</span></div>
                <div style={{ flex: 1, lineHeight: 1.4 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>AI Quality Score</div>
                  <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)" }}>Strong on clarity & blueprint match. Low usage means it stays fresh.</div>
                </div>
              </div>

              {/* Metrics list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {[
                  ["Blueprint alignment", sel?.alignment, "%", "is-success"],
                  ["Readability (Flesch)", 64, "", "is-primary"],
                  ["Estimated solve time", 6, " min", "is-primary"],
                  ["Times used in papers", sel?.usage, "×", "is-primary"],
                  ["Near-duplicate risk", 3, "%", "is-success"],
                ].map(([label, v, suffix, tone]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                    <span style={{ flex: 1, color: "var(--pc-ink-3)" }}>{label}</span>
                    <span className="pc-num" style={{ fontWeight: 500, color: "var(--pc-ink)" }}>{v}{suffix}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 6 }}>Tags</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {["Identities","Proof","HOTS","sec-tan","Class X","Pre-Board"].map(t => <span key={t} className="pc-tag">{t}</span>)}
                </div>
              </div>

              {/* Usage timeline */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Usage timeline</div>
                <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)" }}>
                  {[
                    ["Pre-Board 2024", "Set A · Q-17"],
                    ["Mid-Term 2023", "Set B · Q-12"],
                  ].map(([when, where], i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--pc-primary)" }} />
                      <span style={{ fontSize: 12, color: "var(--pc-ink-2)", fontWeight: 500 }}>{when}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--pc-ink-4)" }}>{where}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Related questions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    ["Q-2210", "Prove sin²θ + cos²θ identity…", 86],
                    ["Q-1058", "If tan θ = 3/4, find sec θ…", 72],
                    ["Q-2904", "Verify cosec²θ – cot²θ = 1…", 65],
                  ].map(([id, body, sim]) => (
                    <div key={id} style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 8, padding: "8px 10px", boxShadow: "var(--pc-shadow-xs)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="pc-mono" style={{ fontSize: 10, color: "var(--pc-ink-4)" }}>{id}</span>
                        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--pc-ink-3)" }} className="pc-num">{sim}% similar</span>
                      </div>
                      <div className="pc-serif" style={{ fontSize: 12.5, color: "var(--pc-ink-2)", lineHeight: 1.4, marginTop: 2 }}>{body}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI suggestion */}
              <div style={{ background: "linear-gradient(180deg, #F1F4FF, #E7ECFF)", border: "1px solid #C9D4FF", borderRadius: 10, padding: "11px 13px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, #2A47CC, #6789FF)", color: "white", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(53,92,255,0.4)" }}>
                  <Icon name="sparkles" size={11} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--pc-primary-ink)" }}>Add a Hindi translation</div>
                  <div style={{ fontSize: 11.5, color: "#3F4F8C", lineHeight: 1.45, marginTop: 2 }}>This question is currently English-only. Generating a bilingual version improves accessibility for ~38% of students.</div>
                  <button className="pc-btn is-sm" style={{ marginTop: 8 }}>Generate translation</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Repository = Repository;
