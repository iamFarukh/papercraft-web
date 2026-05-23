// PaperBuilder.jsx — The Core Composition Experience
// Three-column layout: Question Browser · A4 Paper Canvas (photoreal) · Paper Intelligence
// Drag a question from the left onto the canvas to add it.
// Tweaks expose 3 paper-canvas variations: Classic / Editorial / Bilingual

const PAPER_QUESTIONS_BANK = [
  { id: "Q-2841", chapter: "Quadratic", marks: 3, diff: 3, type: "SA", body: "Solve for x: x² − 6x + 9 = 0 by completing the square.", time: 5 },
  { id: "Q-2842", chapter: "Trigonometry", marks: 5, diff: 4, type: "LA", body: "Prove that (sin θ − cos θ + 1) / (sin θ + cos θ − 1) = 1 / (sec θ − tan θ).", time: 8 },
  { id: "Q-2843", chapter: "Quadratic", marks: 4, diff: 3, type: "LA", body: "A train, travelling at uniform speed for 360 km, would have taken 48 min less had its speed been 5 km/h more. Find its original speed.", time: 7 },
  { id: "Q-2844", chapter: "Real Numbers", marks: 1, diff: 2, type: "MCQ", body: "The HCF of 96 and 404 by the Euclidean algorithm is — (a) 2 (b) 4 (c) 8 (d) 16.", time: 2 },
  { id: "Q-2845", chapter: "AP", marks: 2, diff: 2, type: "SA", body: "Find the 11th term of the AP −27, −22, −17, …", time: 3 },
  { id: "Q-2901", chapter: "Polynomials", marks: 3, diff: 3, type: "SA", body: "Find the zeroes of 6x² − 7x − 3 and verify the relationship with coefficients.", time: 5 },
  { id: "Q-2902", chapter: "Coord. Geom.", marks: 4, diff: 3, type: "LA", body: "Find the area of triangle whose vertices are (2,3), (4,−1) and (−1,2).", time: 6 },
  { id: "Q-2903", chapter: "Statistics", marks: 5, diff: 4, type: "LA", body: "The mean of the following data is 50. Find the missing frequency f. (Class 0–20, 20–40, 40–60, 60–80, 80–100 with freq 17, f, 32, 24, 19).", time: 9 },
  { id: "Q-2904", chapter: "Trigonometry", marks: 2, diff: 2, type: "SA", body: "If tan θ = 3/4, find the value of sec θ.", time: 3 },
  { id: "Q-2905", chapter: "Real Numbers", marks: 3, diff: 2, type: "SA", body: "Prove that √5 is irrational.", time: 4 },
];

// Helper math glyph
const Frac = ({ n, d }) => <span className="pc-frac"><span>{n}</span><span>{d}</span></span>;

const BrowserQuestion = ({ q, onDragStart, used }) => (
  <div
    draggable
    onDragStart={(e) => { e.dataTransfer.setData("application/x-pc-q", q.id); onDragStart && onDragStart(q); e.dataTransfer.effectAllowed = "copy"; }}
    style={{
      background: "var(--pc-surface)",
      border: "1px solid var(--pc-line)",
      borderRadius: 8,
      padding: "10px 12px",
      boxShadow: "var(--pc-shadow-xs)",
      cursor: "grab",
      opacity: used ? 0.45 : 1,
      position: "relative",
    }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <Icon name="drag" size={12} style={{ color: "var(--pc-ink-5)" }} />
      <span className="pc-mono" style={{ fontSize: 10, color: "var(--pc-ink-4)" }}>{q.id}</span>
      <span className="pc-tag is-outline" style={{ height: 18, fontSize: 10, padding: "0 6px" }}>{q.chapter}</span>
      <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)" }}>
        <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{q.marks}</span>m
      </span>
    </div>
    <div className="pc-serif" style={{ fontSize: 12.5, color: "var(--pc-ink-2)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
      {q.body}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
      <span style={{ fontSize: 10, color: "var(--pc-ink-4)" }}>{q.type}</span>
      <Difficulty level={q.diff} />
      {used && <span className="pc-tag is-success" style={{ marginLeft: "auto", height: 18, fontSize: 10 }}>added</span>}
    </div>
  </div>
);

// === Paper Canvas ===

const PaperHeaderClassic = () => (
  <div style={{ textAlign: "center", paddingBottom: 16, borderBottom: "1.5px solid var(--pc-ink)", position: "relative" }}>
    {/* Crest */}
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
      <div style={{ width: 40, height: 40, position: "relative" }}>
        <svg viewBox="0 0 40 40" width="40" height="40">
          <path d="M20 2 L34 8 L34 22 C34 30 28 36 20 38 C12 36 6 30 6 22 L6 8 Z" fill="none" stroke="#15161A" strokeWidth="1.2"/>
          <path d="M20 8 L28 11 L28 22 C28 27 24.5 31 20 32.5 C15.5 31 12 27 12 22 L12 11 Z" fill="#15161A" opacity="0.06"/>
          <text x="20" y="24" textAnchor="middle" fontFamily="Newsreader, serif" fontSize="13" fontStyle="italic" fill="#15161A">S</text>
        </svg>
      </div>
    </div>
    <div className="pc-serif" style={{ fontSize: 19, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pc-ink)" }}>
      Saraswati Vidya Niketan
    </div>
    <div style={{ fontSize: 10.5, color: "var(--pc-ink-3)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 2 }}>
      Senior Secondary · Estd. 1962 · Lucknow
    </div>
    <div style={{ marginTop: 14, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
      <span style={{ flex: 1, height: 1, background: "var(--pc-ink-4)", opacity: 0.4 }} />
      <span className="pc-serif" style={{ fontSize: 15, fontStyle: "italic", color: "var(--pc-ink)" }}>Half-Yearly Examination · 2025–26</span>
      <span style={{ flex: 1, height: 1, background: "var(--pc-ink-4)", opacity: 0.4 }} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, padding: "0 6px", fontSize: 11, color: "var(--pc-ink-2)" }}>
      <span><strong style={{ fontWeight: 500 }}>Class:</strong> X</span>
      <span><strong style={{ fontWeight: 500 }}>Subject:</strong> Mathematics</span>
      <span><strong style={{ fontWeight: 500 }}>Time:</strong> 3 hours</span>
      <span><strong style={{ fontWeight: 500 }}>Max. Marks:</strong> 80</span>
    </div>
  </div>
);

const PaperHeaderEditorial = () => (
  <div style={{ paddingBottom: 14, borderBottom: "1px solid var(--pc-ink-5)" }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
      <div>
        <div style={{ fontSize: 9.5, color: "var(--pc-ink-4)", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500 }}>Saraswati Vidya Niketan · Half-Yearly 2025–26</div>
        <h2 className="pc-serif" style={{ fontSize: 22, fontWeight: 500, margin: "4px 0 0", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
          Mathematics <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic" }}>· Class X</span>
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "2px 14px", fontSize: 10, color: "var(--pc-ink-2)", textAlign: "right" }}>
        <span style={{ color: "var(--pc-ink-4)" }}>Time</span><span>3 hours</span>
        <span style={{ color: "var(--pc-ink-4)" }}>Marks</span><span>80</span>
        <span style={{ color: "var(--pc-ink-4)" }}>Set</span><span>A</span>
      </div>
    </div>
  </div>
);

const PaperHeaderBilingual = () => (
  <div style={{ paddingBottom: 14, borderBottom: "2px double var(--pc-ink-3)", textAlign: "center" }}>
    <div className="pc-serif" style={{ fontSize: 17, fontWeight: 500, letterSpacing: "0.04em" }}>सरस्वती विद्या निकेतन</div>
    <div className="pc-serif" style={{ fontSize: 12, color: "var(--pc-ink-3)", letterSpacing: "0.08em", marginTop: 0 }}>Saraswati Vidya Niketan</div>
    <div className="pc-serif" style={{ fontSize: 14, fontStyle: "italic", color: "var(--pc-ink)", marginTop: 10 }}>अर्द्धवार्षिक परीक्षा · Half-Yearly Examination · 2025–26</div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, padding: "0 2px", fontSize: 10, color: "var(--pc-ink-2)" }}>
      <span><strong>कक्षा / Class:</strong> X</span>
      <span><strong>विषय / Subject:</strong> गणित / Mathematics</span>
      <span><strong>समय / Time:</strong> 3 hrs</span>
      <span><strong>अंक / Marks:</strong> 80</span>
    </div>
  </div>
);

const PaperInstructions = ({ variant }) => (
  <div style={{ marginTop: 14, marginBottom: 10, padding: variant === "editorial" ? 0 : "10px 12px", background: variant === "editorial" ? "transparent" : "rgba(180,160,110,0.08)", borderLeft: variant === "editorial" ? "2px solid var(--pc-ink)" : "none", paddingLeft: variant === "editorial" ? 12 : 12, borderRadius: variant === "editorial" ? 0 : 4 }}>
    <div className="pc-serif" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>General Instructions</div>
    <ol style={{ margin: 0, paddingLeft: 18, fontSize: 10.5, color: "var(--pc-ink-2)", lineHeight: 1.55 }}>
      <li>This question paper contains <strong>five sections</strong> A, B, C, D and E.</li>
      <li>Section A has 20 MCQs of 1 mark each. Section B has 5 questions of 2 marks each.</li>
      <li>Section C has 6 questions of 3 marks each. Section D has 4 questions of 5 marks each.</li>
      <li>Internal choice is provided in 2 questions of Section C and 2 of Section D.</li>
    </ol>
  </div>
);

const SectionHeading = ({ letter, name, marksRule, variant }) => (
  <div style={{
    display: "flex", alignItems: "baseline", gap: 12,
    margin: "20px 0 12px",
    paddingBottom: 6,
    borderBottom: variant === "editorial" ? "1px solid var(--pc-line)" : "1px dashed var(--pc-ink-4)",
  }}>
    <span className="pc-serif" style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--pc-ink)" }}>
      Section {letter} <span style={{ color: "var(--pc-ink-4)", textTransform: "none", fontStyle: "italic", fontWeight: 400 }}>· {name}</span>
    </span>
    <span style={{ flex: 1 }} />
    <span style={{ fontSize: 10, color: "var(--pc-ink-3)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{marksRule}</span>
  </div>
);

const PaperQuestionLine = ({ n, q, variant, onRemove }) => (
  <div style={{ display: "flex", gap: 12, padding: "7px 0", position: "relative" }}
    className="pc-paper-line">
    <span className="pc-serif" style={{ fontSize: 12, fontWeight: 500, minWidth: 22, textAlign: "right", color: "var(--pc-ink)", paddingTop: 1 }}>{n}.</span>
    <div style={{ flex: 1 }}>
      <div className="pc-serif" style={{ fontSize: 12, lineHeight: 1.55, color: "var(--pc-ink)" }}>{q.body}</div>
      {variant === "bilingual" && (
        <div className="pc-serif" style={{ fontSize: 11, lineHeight: 1.55, color: "var(--pc-ink-3)", marginTop: 3 }}>
          {q.hindi || "हिंदी अनुवाद यहाँ प्रदर्शित होगा।"}
        </div>
      )}
    </div>
    <span className="pc-serif" style={{ fontSize: 11, color: "var(--pc-ink-3)", minWidth: 16, textAlign: "right", paddingTop: 2 }}>[{q.marks}]</span>
    {/* hover handle (UI only — hidden on print) */}
    <button onClick={onRemove} className="pc-paper-line-remove" style={{ position: "absolute", left: -28, top: 5, opacity: 0, background: "white", border: "1px solid var(--pc-line)", borderRadius: 5, width: 20, height: 20, display: "grid", placeItems: "center", color: "var(--pc-ink-4)", cursor: "pointer", boxShadow: "var(--pc-shadow-xs)" }}>
      <Icon name="dots" size={11} />
    </button>
  </div>
);

const PaperPage = ({ children, n, total, variant }) => (
  <div className="pc-paper" style={{
    width: 595, minHeight: 842,
    padding: "44px 50px 60px",
    margin: "0 auto",
    position: "relative",
    color: "var(--pc-ink)",
  }}>
    {children}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, display: "flex", justifyContent: "space-between", padding: "0 50px", fontSize: 9, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      <span>Mathematics · Class X · Set A</span>
      <span>Page {n} of {total}</span>
    </div>
    {/* Watermark */}
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <span className="pc-serif" style={{ fontSize: 78, color: "rgba(20,22,26,0.03)", letterSpacing: "0.04em", transform: "rotate(-30deg)", fontWeight: 500 }}>SVN · DRAFT</span>
    </div>
  </div>
);

const PaperBuilder = ({ tweaks }) => {
  const variant = tweaks?.canvas || "classic";

  // The default paper composition (Section-A small, Section-B short, etc.).
  const [paper, setPaper] = React.useState([
    { sec: "A", name: "Objective · 1 mark each", marksRule: "20 × 1 = 20", qs: ["Q-2844","Q-2845"] },
    { sec: "B", name: "Very Short Answer · 2 marks each", marksRule: "5 × 2 = 10", qs: ["Q-2904","Q-2905"] },
    { sec: "C", name: "Short Answer · 3 marks each", marksRule: "6 × 3 = 18", qs: ["Q-2841","Q-2901"] },
    { sec: "D", name: "Long Answer · 5 marks each", marksRule: "4 × 5 = 20", qs: ["Q-2842","Q-2902","Q-2903"] },
  ]);
  const [dropHot, setDropHot] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const usedIds = new Set(paper.flatMap(s => s.qs));

  const addToSection = (qid, secLetter) => {
    setPaper(p => p.map(s => s.sec === secLetter && !s.qs.includes(qid) ? { ...s, qs: [...s.qs, qid] } : s));
  };

  const handleDrop = (e, secLetter) => {
    e.preventDefault();
    const qid = e.dataTransfer.getData("application/x-pc-q");
    if (qid) addToSection(qid, secLetter);
    setDropHot(false);
  };

  const headerCmp = variant === "editorial" ? <PaperHeaderEditorial /> : variant === "bilingual" ? <PaperHeaderBilingual /> : <PaperHeaderClassic />;

  // Filter browser by chapter
  const filteredBank = PAPER_QUESTIONS_BANK.filter(q =>
    !search || q.body.toLowerCase().includes(search.toLowerCase()) || q.chapter.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filteredBank.reduce((acc, q) => { (acc[q.chapter] = acc[q.chapter] || []).push(q); return acc; }, {});

  const totalMarks = paper.reduce((sum, s) => sum + s.qs.reduce((m, qid) => m + (PAPER_QUESTIONS_BANK.find(q => q.id === qid)?.marks || 0), 0), 0);
  const totalQs = paper.reduce((s, sec) => s + sec.qs.length, 0);
  const estTime = paper.reduce((s, sec) => s + sec.qs.reduce((m, qid) => m + (PAPER_QUESTIONS_BANK.find(q => q.id === qid)?.time || 0), 0), 0);

  return (
    <div className="pc-screen">
      <style>{`.pc-paper-line:hover .pc-paper-line-remove { opacity: 1 !important; }`}</style>
      <div className="pc-shell">
        <Sidebar role="admin" active="builder" items={ADMIN_NAV}
          footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
        <div className="pc-work">
          <Topbar
            crumbs={["Papers", "Paper Builder", <span style={{ color: "var(--pc-ink-3)", fontStyle: "italic" }} className="pc-serif">Class X · Mathematics · Half-Yearly</span>]}
            actions={<>
              <button className="pc-btn"><Icon name="eye" size={14} />Preview</button>
              <button className="pc-btn"><Icon name="download" size={14} />Export</button>
              <button className="pc-btn is-primary"><Icon name="check" size={14} />Submit for Approval</button>
            </>}
          />

          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 300px", flex: 1, minHeight: 0, background: "var(--pc-bg-cool)" }}>
            {/* LEFT — Question browser */}
            <aside style={{ borderRight: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--pc-line)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <h3 className="pc-serif" style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>Question Browser</h3>
                  <button className="pc-btn is-sm is-ghost"><Icon name="filter" size={11} /></button>
                </div>
                <div style={{ position: "relative" }}>
                  <Icon name="search" size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--pc-ink-4)" }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bank…" style={{ width: "100%", height: 30, padding: "0 10px 0 30px", borderRadius: 7, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", fontSize: 12, fontFamily: "var(--pc-sans)", outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 8, overflowX: "auto", paddingBottom: 2 }}>
                  {["All","Quadratic","Trig","AP","Stats"].map((c, i) => (
                    <button key={c} className="pc-btn is-sm" style={i === 0 ? { background: "var(--pc-ink)", color: "white", border: "1px solid var(--pc-ink)" } : {}}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="pc-scroll" style={{ flex: 1, padding: "10px 14px 14px", overflow: "auto" }}>
                {Object.entries(grouped).map(([chap, qs]) => (
                  <div key={chap} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{chap}</span>
                      <span style={{ fontSize: 10.5, color: "var(--pc-ink-5)" }} className="pc-num">{qs.length}</span>
                      <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {qs.map(q => <BrowserQuestion key={q.id} q={q} used={usedIds.has(q.id)} />)}
                    </div>
                  </div>
                ))}
              </div>
              {/* AI mini panel */}
              <div style={{ borderTop: "1px solid var(--pc-line)", padding: "12px 14px", background: "var(--pc-surface)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: "linear-gradient(135deg, #2A47CC, #6789FF)", color: "white", display: "grid", placeItems: "center" }}>
                    <Icon name="sparkles" size={10} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--pc-ink)" }}>Composer</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <button className="pc-btn is-sm" style={{ justifyContent: "flex-start" }}><Icon name="sparkles" size={11} />Auto-add best questions</button>
                  <button className="pc-btn is-sm" style={{ justifyContent: "flex-start" }}><Icon name="sliders" size={11} />Balance difficulty mix</button>
                  <button className="pc-btn is-sm" style={{ justifyContent: "flex-start" }}><Icon name="target" size={11} />Match blueprint</button>
                </div>
              </div>
            </aside>

            {/* CENTER — A4 Paper Canvas */}
            <section className="pc-scroll pc-dots" style={{ overflow: "auto", padding: "32px 0 80px", position: "relative" }}>
              {/* Top toolbar over canvas */}
              <div className="pc-float" style={{ position: "sticky", top: 0, margin: "0 auto 24px", width: "fit-content", padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, zIndex: 4 }}>
                <button className="pc-btn is-sm is-ghost"><Icon name="arrowLeft" size={12} />Undo</button>
                <button className="pc-btn is-sm is-ghost">Redo<Icon name="arrowRight" size={12} /></button>
                <span style={{ width: 1, height: 16, background: "var(--pc-line)", margin: "0 4px" }} />
                <button className="pc-btn is-sm is-ghost"><Icon name="bold" size={11} /></button>
                <button className="pc-btn is-sm is-ghost"><Icon name="italic" size={11} /></button>
                <button className="pc-btn is-sm is-ghost"><Icon name="pi" size={11} /></button>
                <button className="pc-btn is-sm is-ghost"><Icon name="image" size={11} /></button>
                <span style={{ width: 1, height: 16, background: "var(--pc-line)", margin: "0 4px" }} />
                <button className="pc-btn is-sm is-ghost">Layout · {variant === "classic" ? "Classic" : variant === "editorial" ? "Editorial" : "Bilingual"}<Icon name="chevDown" size={11} /></button>
                <span style={{ width: 1, height: 16, background: "var(--pc-line)", margin: "0 4px" }} />
                <span style={{ fontSize: 11, color: "var(--pc-ink-3)" }}>Zoom</span>
                <span className="pc-mono" style={{ fontSize: 11, color: "var(--pc-ink-2)", padding: "0 6px" }}>100%</span>
              </div>

              <PaperPage n={1} total={2} variant={variant}>
                {headerCmp}
                <PaperInstructions variant={variant} />

                {paper.map(sec => (
                  <div key={sec.sec}>
                    <SectionHeading letter={sec.sec} name={sec.name} marksRule={sec.marksRule} variant={variant} />
                    <div
                      onDragOver={e => { e.preventDefault(); setDropHot(sec.sec); }}
                      onDragLeave={() => setDropHot(false)}
                      onDrop={e => handleDrop(e, sec.sec)}
                      className={dropHot === sec.sec ? "pc-drop-target" : ""}
                      style={{ minHeight: 40, padding: "2px 0", borderRadius: 4 }}
                    >
                      {sec.qs.length === 0 && (
                        <div style={{ padding: "10px 0", textAlign: "center", color: "var(--pc-ink-4)", fontSize: 11, fontStyle: "italic" }} className="pc-serif">
                          drop questions here ↓
                        </div>
                      )}
                      {sec.qs.map((qid, i) => {
                        const q = PAPER_QUESTIONS_BANK.find(x => x.id === qid);
                        if (!q) return null;
                        return <PaperQuestionLine key={qid} n={i + 1} q={q} variant={variant}
                                onRemove={() => setPaper(p => p.map(s => s.sec === sec.sec ? { ...s, qs: s.qs.filter(x => x !== qid) } : s))} />;
                      })}
                    </div>
                  </div>
                ))}

                {/* End-of-paper mark */}
                <div style={{ textAlign: "center", marginTop: 28, paddingTop: 8, borderTop: "1px solid var(--pc-line)" }}>
                  <span className="pc-serif" style={{ fontSize: 11, color: "var(--pc-ink-3)", fontStyle: "italic", letterSpacing: "0.1em" }}>— end of paper · all the best —</span>
                </div>
              </PaperPage>

              {/* Page break ribbon */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: 595, margin: "20px auto", color: "var(--pc-ink-4)" }}>
                <span style={{ flex: 1, height: 1, background: "var(--pc-line-2)" }} />
                <span style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>page break · 2 / 2</span>
                <span style={{ flex: 1, height: 1, background: "var(--pc-line-2)" }} />
              </div>

              {/* Second page (mostly empty preview) */}
              <PaperPage n={2} total={2} variant={variant}>
                <div style={{ paddingTop: 4, fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>continued · section D</div>
                <div style={{ paddingTop: 14, color: "var(--pc-ink-3)" }}>
                  <PaperQuestionLine n={3} q={PAPER_QUESTIONS_BANK.find(q => q.id === "Q-2842")} variant={variant} onRemove={() => {}} />
                  <PaperQuestionLine n={4} q={PAPER_QUESTIONS_BANK.find(q => q.id === "Q-2903")} variant={variant} onRemove={() => {}} />
                </div>
                <SectionHeading letter="E" name="Case-Based · 4 marks each" marksRule="3 × 4 = 12" variant={variant} />
                <div style={{ padding: "10px 0", textAlign: "center", color: "var(--pc-ink-4)", fontSize: 11, fontStyle: "italic" }} className="pc-serif">
                  drop case-based questions here ↓
                </div>
              </PaperPage>
            </section>

            {/* RIGHT — Paper Intelligence */}
            <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "16px 18px", overflow: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Paper Intelligence</div>
                <h3 className="pc-serif" style={{ fontSize: 16, fontWeight: 500, margin: "2px 0 0", letterSpacing: "-0.015em", lineHeight: 1.2 }}>
                  Live composition health
                </h3>
              </div>

              {/* Key stats grid */}
              <div className="pc-panel" style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 14px" }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>Marks</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="pc-serif" style={{ fontSize: 22, fontWeight: 500 }}>{totalMarks}</span>
                    <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>/ 80</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>Questions</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="pc-serif" style={{ fontSize: 22, fontWeight: 500 }}>{totalQs}</span>
                    <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>added</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>Solve time</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="pc-serif" style={{ fontSize: 22, fontWeight: 500 }}>{estTime}</span>
                    <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>/ 180 min</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>Quality</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="pc-serif" style={{ fontSize: 22, fontWeight: 500 }}>82</span>
                    <div className="pc-bar is-primary" style={{ flex: 1 }}><span style={{ width: "82%" }} /></div>
                  </div>
                </div>
              </div>

              {/* Blueprint */}
              <div className="pc-panel" style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 500 }}>Blueprint compliance</span>
                  <span className="pc-tag is-success">94%</span>
                </div>
                {[
                  ["Real Numbers", 6, 6],
                  ["Polynomials", 5, 6],
                  ["Quadratic Eq.", 10, 10],
                  ["AP", 6, 8],
                  ["Trigonometry", 12, 12],
                  ["Coord. Geom.", 6, 6],
                  ["Statistics", 12, 12],
                ].map(([c, got, target]) => (
                  <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 11.5 }}>
                    <span style={{ flex: 1, color: "var(--pc-ink-2)" }}>{c}</span>
                    <div className="pc-bar" style={{ width: 70 }}><span style={{ width: `${Math.min(100, (got/target)*100)}%`, background: got >= target ? "var(--pc-success)" : "var(--pc-warning)" }} /></div>
                    <span className="pc-num" style={{ minWidth: 36, textAlign: "right", color: "var(--pc-ink-3)" }}>{got}/{target}</span>
                  </div>
                ))}
              </div>

              {/* Difficulty distribution */}
              <div className="pc-panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 500, marginBottom: 10 }}>Difficulty distribution</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70, padding: "0 4px" }}>
                  {[
                    { l: "Easy", v: 28, target: 30, c: "#14B87A" },
                    { l: "Med", v: 44, target: 40, c: "#355CFF" },
                    { l: "Hard", v: 22, target: 22, c: "#E08A1F" },
                    { l: "HOTS", v: 6, target: 8, c: "#DC4A3D" },
                  ].map(d => (
                    <div key={d.l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ position: "relative", width: "100%", height: 56, display: "flex", alignItems: "flex-end" }}>
                        <div style={{ position: "absolute", left: 0, right: 0, bottom: `${d.target * 1.2}px`, height: 1, background: "var(--pc-ink-5)", borderTop: "1px dashed var(--pc-ink-5)" }} />
                        <div style={{ width: "100%", height: d.v * 1.2 + "px", background: d.c, borderRadius: "3px 3px 0 0", boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.06)" }} />
                      </div>
                      <span style={{ fontSize: 10, color: "var(--pc-ink-4)" }}>{d.l}</span>
                      <span style={{ fontSize: 10, color: "var(--pc-ink-3)" }} className="pc-num">{d.v}%</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", textAlign: "center", marginTop: 8, fontStyle: "italic" }} className="pc-serif">dashed line · blueprint target</div>
              </div>

              {/* Suggestions */}
              <div className="pc-panel" style={{ padding: 14, background: "linear-gradient(180deg, #FFFFFF, #FAFAF7)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: "linear-gradient(135deg, #2A47CC, #6789FF)", color: "white", display: "grid", placeItems: "center" }}>
                    <Icon name="sparkles" size={11} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>Quiet suggestions</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5, color: "var(--pc-ink-2)" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ width: 4, height: 4, borderRadius: 2, background: "var(--pc-warning)", marginTop: 7 }} />
                    <span><strong style={{ fontWeight: 500 }}>AP</strong> is 2 marks below blueprint target. <a style={{ color: "var(--pc-primary)" }}>Add 1 SA question →</a></span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ width: 4, height: 4, borderRadius: 2, background: "var(--pc-primary)", marginTop: 7 }} />
                    <span>HOTS share is light. <a style={{ color: "var(--pc-primary)" }}>Suggest 1 Trig HOTS →</a></span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ width: 4, height: 4, borderRadius: 2, background: "var(--pc-success)", marginTop: 7 }} />
                    <span>No duplicates detected across last 4 papers.</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

window.PaperBuilder = PaperBuilder;
