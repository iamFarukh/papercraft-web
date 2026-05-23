// PaperBuilderV2.jsx — Paper Builder workspace foundation (6 screens)
//
// Flow:
//   ① Start      · "New paper" setup card — title, school, subject, duration, sections
//   ② Empty      · 3-panel workspace, paper canvas with empty sections (calm empty state)
//   ③ Composing  · partial fill — a question being added live
//   ④ Complete   · fully-composed paper, all 3 sections filled
//   ⑤ Preview    · full-bleed paper canvas, no side panels (what the printed paper looks like)
//   ⑥ Submit     · "submit for approval" modal over the complete state
//
// Workspace shape (steps 2-4):
//   320 LEFT (Repository Browser) | CENTER (A4 paper canvas) | 320 RIGHT (Paper Insights)
//   Editorial · operational · calm · paper-oriented.

// ───────────────────────────────────────────────────────────────────────────
// Mock data
// ───────────────────────────────────────────────────────────────────────────

const PBV2_REPO = [
  { id: "Q-2841", chap: "Quadratic", topic: "Roots", type: "SA",  marks: 3, diff: 3, time: 5, body: "Solve for x: x² − 6x + 9 = 0 by completing the square." },
  { id: "Q-2842", chap: "Trigonometry", topic: "Identities", type: "LA", marks: 5, diff: 4, time: 8, body: "Prove that (sin θ − cos θ + 1) / (sin θ + cos θ − 1) = 1 / (sec θ − tan θ)." },
  { id: "Q-2843", chap: "Quadratic", topic: "Word problem", type: "LA", marks: 4, diff: 3, time: 7, body: "A train, travelling at uniform speed for 360 km, would have taken 48 min less had its speed been 5 km/h more. Find its original speed." },
  { id: "Q-2844", chap: "Real Numbers", topic: "HCF", type: "MCQ", marks: 1, diff: 2, time: 2, body: "The HCF of 96 and 404 by the Euclidean algorithm is — (a) 2 (b) 4 (c) 8 (d) 16." },
  { id: "Q-2845", chap: "AP", topic: "n-th term", type: "SA", marks: 2, diff: 2, time: 3, body: "Find the 11th term of the AP −27, −22, −17, …" },
  { id: "Q-2846", chap: "Polynomials", topic: "Zeroes", type: "SA",  marks: 3, diff: 3, time: 5, body: "Find the zeroes of 6x² − 7x − 3 and verify the relationship with coefficients." },
  { id: "Q-2847", chap: "Coord. Geom.", topic: "Area", type: "LA", marks: 4, diff: 3, time: 6, body: "Find the area of triangle whose vertices are (2,3), (4,−1) and (−1,2)." },
  { id: "Q-2848", chap: "Statistics", topic: "Mean", type: "LA", marks: 5, diff: 4, time: 9, body: "The mean of the following data is 50. Find the missing frequency f." },
];
const PBV2_REPO_FIX = PBV2_REPO; // (alias kept for clarity; data is the array above)

// Helper math glyph
const PBFrac = ({ n, d }) => <span className="pc-frac"><span>{n}</span><span>{d}</span></span>;

// ───────────────────────────────────────────────────────────────────────────
// Top toolbar — shared across builder screens
// ───────────────────────────────────────────────────────────────────────────

const PBToolbar = ({ title = "Class X · Mathematics · Half-Yearly 2025–26", status = "Draft", saved = "Saved · 12s ago", showSubmit = true }) => (
  <div style={{
    height: 52, borderBottom: "1px solid var(--pc-line)",
    background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    padding: "0 22px", display: "flex", alignItems: "center", gap: 10,
  }}>
    <span style={{ width: 30, height: 30, borderRadius: 7, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", display: "grid", placeItems: "center", boxShadow: "var(--pc-shadow-xs)" }}>
      <Icon name="file" size={14} style={{ color: "var(--pc-ink-3)" }} />
    </span>
    <div style={{ lineHeight: 1.2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="pc-serif" style={{ fontSize: 14, fontWeight: 500, color: "var(--pc-ink)", letterSpacing: "-0.012em" }}>{title}</span>
        <span className={"pc-tag " + (status === "Ready" ? "is-success" : status === "Submitted" ? "is-primary" : "is-warning")} style={{ height: 18, fontSize: 10 }}>{status}</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{saved}</div>
    </div>

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
      <button className="pc-btn is-sm"><Icon name="history" size={12} />History</button>
      <button className="pc-btn is-sm"><Icon name="setting" size={12} />Settings</button>
      <button className="pc-btn is-sm"><Icon name="eye" size={12} />Preview</button>
      <button className="pc-btn is-sm"><Icon name="download" size={12} />Export</button>
      <span style={{ width: 1, height: 22, background: "var(--pc-line)", margin: "0 4px" }} />
      <button className="pc-btn is-sm"><Icon name="check" size={12} />Save draft</button>
      {showSubmit && <button className="pc-btn is-primary is-sm"><Icon name="play" size={12} />Submit for approval</button>}
    </div>
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
// LEFT panel — compact Repository Browser
// ───────────────────────────────────────────────────────────────────────────

const QuickFilter = ({ label, value, count, active }) => (
  <button style={{
    height: 26, padding: "0 9px", borderRadius: 999, fontFamily: "var(--pc-sans)",
    border: "1px solid " + (active ? "var(--pc-primary)" : "var(--pc-line)"),
    background: active ? "var(--pc-primary-50)" : "var(--pc-surface)",
    color: active ? "var(--pc-primary-ink)" : "var(--pc-ink-2)",
    fontSize: 11.5, fontWeight: 500, cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 5,
  }}>
    <span style={{ color: "var(--pc-ink-4)", fontWeight: 400 }}>{label}</span>{value}
    {count != null && <span className="pc-num" style={{ marginLeft: 3, color: "var(--pc-ink-4)" }}>· {count}</span>}
  </button>
);

const MiniQCard = ({ q, used, draggable = true, highlighted }) => (
  <div style={{
    background: "var(--pc-surface)",
    border: "1px solid " + (highlighted ? "var(--pc-primary)" : "var(--pc-line)"),
    boxShadow: highlighted ? "0 0 0 3px rgba(53,92,255,0.12), var(--pc-shadow-xs)" : "var(--pc-shadow-xs)",
    borderRadius: 8, padding: "10px 11px",
    opacity: used ? 0.5 : 1, cursor: draggable ? "grab" : "default",
    position: "relative",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <Icon name="drag" size={11} style={{ color: "var(--pc-ink-5)" }} />
      <span className="pc-mono" style={{ fontSize: 10, color: "var(--pc-ink-4)" }}>{q.id}</span>
      <span className="pc-tag is-outline" style={{ height: 17, fontSize: 9.5, padding: "0 5px" }}>{q.chap}</span>
      <span style={{ marginLeft: "auto", fontSize: 10.5 }}><span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{q.marks}</span><span style={{ color: "var(--pc-ink-4)" }}>m</span></span>
    </div>
    <div className="pc-serif" style={{ fontSize: 12.5, color: "var(--pc-ink-2)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{q.body}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
      <span style={{ fontSize: 10, color: "var(--pc-ink-4)" }}>{q.type}</span>
      <Difficulty level={q.diff} />
      <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--pc-ink-4)" }}>~{q.time}m</span>
      {used
        ? <span className="pc-tag is-success" style={{ height: 17, fontSize: 9.5 }}>added</span>
        : <button style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", color: "var(--pc-ink-3)", cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "var(--pc-shadow-xs)" }}><Icon name="plus" size={11} /></button>}
    </div>
  </div>
);

const RepoBrowser = ({ usedIds = new Set(), dragOver, highlightedId }) => (
  <aside style={{ borderRight: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--pc-line)" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Repository</span>
        <button style={{ marginLeft: "auto", background: "transparent", border: 0, color: "var(--pc-primary)", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--pc-sans)" }}>Open</button>
      </div>

      <div style={{ position: "relative", marginBottom: 10 }}>
        <Icon name="search" size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--pc-ink-4)" }} />
        <input placeholder="Search questions…"
          style={{ width: "100%", height: 30, padding: "0 12px 0 32px", borderRadius: 7, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", fontSize: 12, fontFamily: "var(--pc-sans)", outline: "none", boxShadow: "var(--pc-shadow-xs)" }} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        <QuickFilter label="Class:" value="X" active />
        <QuickFilter label="Subject:" value="Math" active />
        <QuickFilter label="" value="Quadratic" count={29} active />
        <QuickFilter label="Marks:" value="3–5" />
        <QuickFilter label="Diff:" value="Med + Hard" />
      </div>
    </div>

    {/* Section header */}
    <div style={{ padding: "12px 16px 4px", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11.5, fontWeight: 500, color: "var(--pc-ink-2)" }}>248 results</span>
      <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
      <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>Sort · Recent</span>
    </div>

    <div className="pc-scroll" style={{ flex: 1, overflow: "auto", padding: "8px 14px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
      {PBV2_REPO.map(q => (
        <MiniQCard key={q.id} q={q} used={usedIds.has(q.id)} highlighted={highlightedId === q.id} />
      ))}
      {dragOver && (
        <div style={{ marginTop: 6, padding: "10px 12px", border: "1.5px dashed var(--pc-primary)", borderRadius: 8, background: "var(--pc-primary-50)", fontSize: 11.5, color: "var(--pc-primary-ink)", textAlign: "center" }}>
          Dragging Q-2842 → drop into Section B
        </div>
      )}
    </div>
  </aside>
);

// ───────────────────────────────────────────────────────────────────────────
// RIGHT panel — Paper Insights
// ───────────────────────────────────────────────────────────────────────────

const Pie = ({ slices, size = 84 }) => {
  const total = slices.reduce((a, s) => a + s.v, 0);
  let acc = 0;
  const r = size / 2 - 6, cx = size / 2, cy = size / 2;
  const arc = (start, end) => {
    const a0 = (start / total) * 2 * Math.PI - Math.PI / 2;
    const a1 = (end   / total) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = end - start > total / 2 ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => {
        const d = arc(acc, acc + s.v); acc += s.v;
        return <path key={i} d={d} fill={s.color} />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--pc-surface)" />
    </svg>
  );
};

const PaperInsights = ({ marks = 0, totalMarks = 80, duration = 0, planMins = 180, questions = 0, planQ = 25, diffEasy = 0, diffMed = 0, diffHard = 0, sectionA = 0, sectionB = 0, sectionC = 0, status = "Empty draft", statusTone = "is-warning", warnings = 0, ready = false }) => (
  <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "18px 18px 22px", overflow: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
    <div>
      <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Paper Insights</div>
      <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginTop: 2 }}>Live as you compose.</div>
    </div>

    {/* Headline status */}
    <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12, boxShadow: "var(--pc-shadow-xs)", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: 4, background: ready ? "var(--pc-success)" : warnings > 0 ? "var(--pc-warning)" : "var(--pc-ink-4)" }} />
        <span style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>Paper status</span>
      </div>
      <div className="pc-serif" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.018em", color: "var(--pc-ink)" }}>{status}</div>
      <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", marginTop: 3 }}>
        {ready ? "Looks balanced — ready for review."
          : warnings > 0 ? `${warnings} thing${warnings > 1 ? "s" : ""} to resolve before submitting.`
          : "Add questions to begin composing."}
      </div>
    </div>

    {/* Headline stats */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)" }}>
        <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Total marks</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
          <span className="pc-serif pc-num" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em" }}>{marks}</span>
          <span style={{ fontSize: 12, color: "var(--pc-ink-4)" }}>/ {totalMarks}</span>
        </div>
        <div className="pc-bar is-primary" style={{ marginTop: 8 }}><span style={{ width: `${(marks / totalMarks) * 100}%` }} /></div>
      </div>
      <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)" }}>
        <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Est. duration</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
          <span className="pc-serif pc-num" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em" }}>{duration}</span>
          <span style={{ fontSize: 12, color: "var(--pc-ink-4)" }}>min</span>
        </div>
        <div className="pc-bar is-success" style={{ marginTop: 8 }}><span style={{ width: `${(duration / planMins) * 100}%` }} /></div>
      </div>
      <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)" }}>
        <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Questions</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
          <span className="pc-serif pc-num" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em" }}>{questions}</span>
          <span style={{ fontSize: 12, color: "var(--pc-ink-4)" }}>/ {planQ}</span>
        </div>
        <div className="pc-bar" style={{ marginTop: 8 }}><span style={{ width: `${(questions / planQ) * 100}%` }} /></div>
      </div>
      <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)" }}>
        <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Sections</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
          <span className="pc-serif pc-num" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em" }}>3</span>
          <span style={{ fontSize: 12, color: "var(--pc-ink-4)" }}>A · B · C</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--pc-ink-3)", marginTop: 6 }}>Compulsory · Choice · Long</div>
      </div>
    </div>

    {/* Difficulty balance */}
    <div>
      <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Difficulty balance</div>
      <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, boxShadow: "var(--pc-shadow-xs)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 14 }}>
        <Pie slices={[
          { v: Math.max(diffEasy, 0.01), color: "var(--pc-success)" },
          { v: Math.max(diffMed,  0.01), color: "var(--pc-primary)" },
          { v: Math.max(diffHard, 0.01), color: "var(--pc-warning)" },
        ]} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {[["Easy", diffEasy, "var(--pc-success)"], ["Medium", diffMed, "var(--pc-primary)"], ["Hard", diffHard, "var(--pc-warning)"]].map(([k, v, c]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5 }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: c }} />
              <span style={{ color: "var(--pc-ink-3)" }}>{k}</span>
              <span className="pc-num" style={{ marginLeft: "auto", fontWeight: 500, color: "var(--pc-ink)" }}>{v}</span>
              <span style={{ color: "var(--pc-ink-4)", fontSize: 10.5, width: 28, textAlign: "right" }}>
                {questions ? `${Math.round((v / Math.max(questions, 1)) * 100)}%` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Section distribution */}
    <div>
      <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Section distribution</div>
      <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, boxShadow: "var(--pc-shadow-xs)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
        {[
          ["Section A", sectionA, 6,  "Compulsory · 1 mark each"],
          ["Section B", sectionB, 6,  "Choice · 3 marks each"],
          ["Section C", sectionC, 4,  "Long · 5 marks each"],
        ].map(([k, v, plan, hint]) => (
          <div key={k}>
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 3, fontSize: 11.5 }}>
              <span style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{k}</span>
              <span style={{ marginLeft: "auto" }}><span className="pc-num" style={{ color: "var(--pc-ink)", fontWeight: 500 }}>{v}</span><span style={{ color: "var(--pc-ink-4)" }}>/{plan}</span></span>
            </div>
            <div className="pc-bar is-primary"><span style={{ width: `${(v / plan) * 100}%` }} /></div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", marginTop: 3 }}>{hint}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Hints */}
    {warnings > 0 && (
      <div style={{ background: "var(--pc-warning-bg)", border: "1px solid #F0D798", borderRadius: 10, padding: "11px 13px", fontSize: 11.5, color: "#7A4F0E", lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <Icon name="info" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Section A is short by 2 questions. Section C is balanced. Difficulty mix leans Medium — consider one more Easy.</span>
      </div>
    )}
  </aside>
);

// ───────────────────────────────────────────────────────────────────────────
// Paper canvas pieces
// ───────────────────────────────────────────────────────────────────────────

const PaperHeader = ({ title = "Half-Yearly Examination · 2025–26" }) => (
  <div style={{ textAlign: "center", paddingBottom: 14, borderBottom: "1.5px solid var(--pc-ink)" }}>
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
      <svg viewBox="0 0 40 40" width="36" height="36">
        <path d="M20 2 L34 8 L34 22 C34 30 28 36 20 38 C12 36 6 30 6 22 L6 8 Z" fill="none" stroke="#15161A" strokeWidth="1.2"/>
        <text x="20" y="24" textAnchor="middle" fontFamily="Newsreader, serif" fontSize="13" fontStyle="italic" fill="#15161A">S</text>
      </svg>
    </div>
    <div className="pc-serif" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      Saraswati Vidya Niketan
    </div>
    <div style={{ fontSize: 10, color: "var(--pc-ink-3)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 2 }}>
      Senior Secondary · Estd. 1962 · Lucknow
    </div>
    <div style={{ marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
      <span style={{ flex: 1, height: 1, background: "var(--pc-ink-4)", opacity: 0.4 }} />
      <span className="pc-serif" style={{ fontSize: 14, fontStyle: "italic" }}>{title}</span>
      <span style={{ flex: 1, height: 1, background: "var(--pc-ink-4)", opacity: 0.4 }} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "0 4px", fontSize: 11, color: "var(--pc-ink-2)" }}>
      <span><strong style={{ fontWeight: 500 }}>Class</strong> X</span>
      <span><strong style={{ fontWeight: 500 }}>Subject</strong> Mathematics</span>
      <span><strong style={{ fontWeight: 500 }}>Time</strong> 3 hr</span>
      <span><strong style={{ fontWeight: 500 }}>Max marks</strong> 80</span>
    </div>
  </div>
);

const GeneralInstructions = () => (
  <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--pc-ink-2)", lineHeight: 1.55 }}>
    <div className="pc-serif" style={{ fontSize: 12.5, fontWeight: 500, textAlign: "center", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>General Instructions</div>
    <ol style={{ margin: "0 0 0 22px", padding: 0, color: "var(--pc-ink-3)" }}>
      <li>All questions are compulsory. The paper consists of three sections.</li>
      <li>Section A contains 6 questions of 1 mark each (MCQ / one-word).</li>
      <li>Section B contains 6 questions of 3 marks each. Internal choice in 2 questions.</li>
      <li>Use of calculators is not permitted.</li>
    </ol>
  </div>
);

const SectionHead = ({ letter, name, hint, marks, count, dropping }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0 8px", borderBottom: "1px dashed var(--pc-line)" }}>
    <span className="pc-serif" style={{ fontSize: 16, fontWeight: 500, color: "var(--pc-ink)", letterSpacing: "-0.012em" }}>
      Section {letter} <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>· {name}</span>
    </span>
    {dropping && <span className="pc-tag is-primary" style={{ height: 18, fontSize: 10 }}>drop to insert</span>}
    <span style={{ flex: 1 }} />
    <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}><span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{count}</span> questions · <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{marks}</span> marks</span>
  </div>
);

const SectionInstructions = ({ text }) => (
  <div style={{ marginTop: 6, fontSize: 11, color: "var(--pc-ink-3)", fontStyle: "italic" }}>{text}</div>
);

const EmptySectionPlaceholder = ({ hint, dropping }) => (
  <div style={{
    marginTop: 10, padding: "22px 18px",
    border: "1.5px dashed " + (dropping ? "var(--pc-primary)" : "var(--pc-line-2)"),
    borderRadius: 8,
    background: dropping ? "var(--pc-primary-50)" : "transparent",
    textAlign: "center",
  }}>
    <div className="pc-serif" style={{ fontSize: 13, fontStyle: "italic", color: dropping ? "var(--pc-primary-ink)" : "var(--pc-ink-4)" }}>
      {dropping ? "Release to add Q-2842 here" : "No questions added yet"}
    </div>
    <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", marginTop: 4 }}>{hint}</div>
  </div>
);

const PaperQuestion = ({ n, q, choice }) => (
  <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 60px", gap: 12, marginTop: 12, alignItems: "baseline" }}>
    <span className="pc-serif pc-num" style={{ fontSize: 13, fontWeight: 500, color: "var(--pc-ink)" }}>Q{n}.</span>
    <div>
      <div className="pc-serif" style={{ fontSize: 13, color: "var(--pc-ink)", lineHeight: 1.55, letterSpacing: "-0.005em" }}>{q.body}</div>
      {choice && (
        <>
          <div className="pc-serif" style={{ fontSize: 11, color: "var(--pc-ink-3)", fontStyle: "italic", textAlign: "center", margin: "8px 0 4px" }}>OR</div>
          <div className="pc-serif" style={{ fontSize: 13, color: "var(--pc-ink)", lineHeight: 1.55 }}>{choice.body}</div>
        </>
      )}
    </div>
    <span style={{ fontSize: 11.5, color: "var(--pc-ink-3)", textAlign: "right" }}><span className="pc-num" style={{ fontWeight: 500, color: "var(--pc-ink)" }}>{q.marks}</span> marks</span>
  </div>
);

// Paper canvas wrapper — centered A4 surface
const PaperCanvas = ({ children, focusMode = false, hoverState }) => (
  <main style={{
    flex: 1, minWidth: 0, background: focusMode ? "#1A1D24" : "var(--pc-bg)",
    overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center",
    padding: focusMode ? "32px 24px" : "26px 24px 44px",
  }} className={focusMode ? "" : "pc-dots"}>
    <div className="pc-paper" style={{
      width: 760, minHeight: 1040, padding: "44px 56px",
      transition: "transform .2s",
      transform: hoverState ? "translateY(-2px)" : "none",
    }}>
      {children}
    </div>
  </main>
);

// ───────────────────────────────────────────────────────────────────────────
// Shell — sidebar + topbar + toolbar wrapper
// ───────────────────────────────────────────────────────────────────────────

const PBShell = ({ children, toolbarProps }) => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="builder" items={ADMIN_NAV}
        footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar
          crumbs={["Academic", "Paper Builder", "Half-Yearly 2025–26"]}
          actions={<button className="pc-btn"><Icon name="users" size={13} />Share</button>}
        />
        <PBToolbar {...toolbarProps} />
        {children}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// ① START — New paper creation card
// ═══════════════════════════════════════════════════════════════════════════

const PBV2Start = () => (
  <PBShell toolbarProps={{ title: "New Paper · untitled", status: "Draft", saved: "Not saved yet", showSubmit: false }}>
    <div style={{ flex: 1, minHeight: 0, background: "var(--pc-bg)", display: "grid", placeItems: "center", padding: "32px" }} className="pc-dots">
      <div style={{ width: 720, background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 18, boxShadow: "var(--pc-shadow-lg)", padding: "32px 36px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", display: "grid", placeItems: "center", boxShadow: "var(--pc-shadow-xs)" }}>
            <Icon name="file" size={20} style={{ color: "var(--pc-ink-3)" }} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Step 1 of 5</div>
            <h2 className="pc-serif" style={{ fontSize: 22, fontWeight: 500, margin: "2px 0 2px", letterSpacing: "-0.022em" }}>Set up your paper</h2>
            <div style={{ fontSize: 12.5, color: "var(--pc-ink-3)" }}>Title, subject, duration, structure. You can change anything later.</div>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { label: "Paper title", value: "Half-Yearly Examination · 2025–26", span: 2 },
            { label: "Class",       value: "X" },
            { label: "Subject",     value: "Mathematics" },
            { label: "Duration",    value: "3 hours" },
            { label: "Total marks", value: "80" },
            { label: "Session",     value: "2025–26 · Term II", span: 2 },
          ].map((f, i) => (
            <label key={i} style={{ gridColumn: f.span === 2 ? "span 2" : "auto", display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{f.label}</span>
              <input defaultValue={f.value} style={{ height: 36, padding: "0 12px", borderRadius: 8, border: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", fontSize: 13, fontFamily: f.label === "Paper title" ? "var(--pc-serif)" : "var(--pc-sans)", color: "var(--pc-ink)", outline: "none", boxShadow: "var(--pc-shadow-xs)" }} />
            </label>
          ))}
        </div>

        {/* Sections preset */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Sections</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { letter: "A", name: "Compulsory · MCQ", marks: "1 × 6", count: 6 },
              { letter: "B", name: "Short answer",      marks: "3 × 6", count: 6 },
              { letter: "C", name: "Long answer",       marks: "5 × 4", count: 4 },
            ].map(s => (
              <div key={s.letter} style={{ background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", borderRadius: 10, padding: "10px 12px" }}>
                <div className="pc-serif" style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.015em" }}>Section {s.letter} <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>· {s.name}</span></div>
                <div style={{ fontSize: 11, color: "var(--pc-ink-3)", marginTop: 3, display: "flex", gap: 10 }}>
                  <span><span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{s.count}</span> Q</span>
                  <span>{s.marks} marks</span>
                </div>
              </div>
            ))}
          </div>
          <button className="pc-btn is-sm is-ghost" style={{ marginTop: 8 }}><Icon name="plus" size={11} />Add section</button>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 26, paddingTop: 18, borderTop: "1px solid var(--pc-line)", gap: 10 }}>
          <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Or start from a <a href="#" style={{ color: "var(--pc-primary)", textDecoration: "none" }}>blueprint</a>.</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="pc-btn">Cancel</button>
            <button className="pc-btn is-primary">Start composing<Icon name="arrowRight" size={13} /></button>
          </div>
        </div>
      </div>
    </div>
  </PBShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ② EMPTY — Workspace with empty paper canvas
// ═══════════════════════════════════════════════════════════════════════════

const PBV2Empty = () => (
  <PBShell toolbarProps={{ saved: "Saved · just now", status: "Draft", showSubmit: false }}>
    <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "320px 1fr 320px" }}>
      <RepoBrowser />
      <PaperCanvas>
        <PaperHeader />
        <GeneralInstructions />
        {[
          { l: "A", n: "Compulsory · 1 mark each",       hint: "Drop 1-mark MCQ or one-word questions here" },
          { l: "B", n: "Short answer · 3 marks each",    hint: "Drop 3-mark Short Answer questions here" },
          { l: "C", n: "Long answer · 5 marks each",     hint: "Drop 5-mark Long Answer questions here" },
        ].map((s, i) => (
          <div key={s.l}>
            <SectionHead letter={s.l} name={s.n.split(" · ")[0]} count={0} marks={0} />
            <SectionInstructions text={"All questions in Section " + s.l + " are compulsory."} />
            <EmptySectionPlaceholder hint={s.hint} />
          </div>
        ))}

        {/* Editorial empty CTA */}
        <div style={{ marginTop: 36, padding: "22px 24px", background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 12, textAlign: "center" }}>
          <Icon name="sparkles" size={18} style={{ color: "var(--pc-ink-4)" }} />
          <div className="pc-serif" style={{ fontSize: 16, fontWeight: 500, marginTop: 8, letterSpacing: "-0.018em" }}>Compose your examination paper</div>
          <div style={{ fontSize: 12, color: "var(--pc-ink-3)", marginTop: 4, lineHeight: 1.5, maxWidth: 480, margin: "4px auto 0" }}>
            Drag questions from the Repository on the left, or start from a blueprint to pre-fill sections.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
            <button className="pc-btn is-sm"><Icon name="target" size={11} />Start from blueprint</button>
            <button className="pc-btn is-sm is-ghost"><Icon name="archive" size={11} />Browse repository</button>
          </div>
        </div>
      </PaperCanvas>
      <PaperInsights status="Empty draft" />
    </div>
  </PBShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ③ COMPOSING — Mid-flow, a question being added
// ═══════════════════════════════════════════════════════════════════════════

const PBV2Composing = () => {
  const used = new Set(["Q-2841", "Q-2844", "Q-2845", "Q-2846"]);
  return (
    <PBShell toolbarProps={{ saved: "Saved · 4s ago", status: "Draft", showSubmit: false }}>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "320px 1fr 320px" }}>
        <RepoBrowser usedIds={used} dragOver highlightedId="Q-2842" />
        <PaperCanvas hoverState>
          <PaperHeader />
          <GeneralInstructions />

          {/* Section A — partially filled */}
          <SectionHead letter="A" name="Compulsory · 1 mark each" count={2} marks={2} />
          <SectionInstructions text="All questions in Section A are compulsory. Tick the most appropriate option." />
          <PaperQuestion n={1} q={PBV2_REPO[3]} />
          <PaperQuestion n={2} q={PBV2_REPO[4]} />
          <div style={{ marginTop: 12, padding: "11px 14px", border: "1px dashed var(--pc-line-2)", borderRadius: 8, fontSize: 11.5, color: "var(--pc-ink-4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><span className="pc-serif" style={{ fontStyle: "italic" }}>4 more 1-mark questions needed</span> · current: 2 / 6</span>
            <button className="pc-btn is-sm is-ghost"><Icon name="plus" size={11} />Add from repository</button>
          </div>

          {/* Section B — being added to */}
          <SectionHead letter="B" name="Short answer · 3 marks each" count={2} marks={6} dropping />
          <SectionInstructions text="Section B contains short-answer questions. Internal choice provided in 2 questions." />
          <PaperQuestion n={3} q={PBV2_REPO[0]} />
          <PaperQuestion n={4} q={PBV2_REPO[5]} />
          <div style={{ marginTop: 12, padding: "13px 14px", border: "1.5px dashed var(--pc-primary)", borderRadius: 8, background: "var(--pc-primary-50)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: "var(--pc-primary)", color: "white", display: "grid", placeItems: "center" }}>
              <Icon name="plus" size={13} />
            </span>
            <div style={{ flex: 1 }}>
              <div className="pc-serif" style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-primary-ink)" }}>Release here to add Q-2842 as Question 5</div>
              <div style={{ fontSize: 11, color: "#3F4F8C" }}>Trigonometry · 5 marks · ~8 min</div>
            </div>
            <span className="pc-tag" style={{ height: 18, fontSize: 10 }}>shift + drop = duplicate</span>
          </div>

          {/* Section C — empty */}
          <SectionHead letter="C" name="Long answer · 5 marks each" count={0} marks={0} />
          <SectionInstructions text="Section C contains long-answer questions. Show all working." />
          <EmptySectionPlaceholder hint="Drop 5-mark Long Answer questions here" />
        </PaperCanvas>
        <PaperInsights status="In progress" statusTone="is-warning"
          marks={14} duration={32} questions={4}
          diffEasy={2} diffMed={2} diffHard={0}
          sectionA={2} sectionB={2} sectionC={0}
          warnings={2} />
      </div>
    </PBShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ④ COMPLETE — Fully composed paper
// ═══════════════════════════════════════════════════════════════════════════

const PBV2Complete = () => {
  const used = new Set(["Q-2841", "Q-2842", "Q-2843", "Q-2844", "Q-2845", "Q-2846", "Q-2847", "Q-2848"]);
  return (
    <PBShell toolbarProps={{ saved: "Saved · 10s ago", status: "Ready" }}>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "320px 1fr 320px" }}>
        <RepoBrowser usedIds={used} />
        <PaperCanvas>
          <PaperHeader />
          <GeneralInstructions />

          <SectionHead letter="A" name="Compulsory · 1 mark each" count={6} marks={6} />
          <SectionInstructions text="All questions in Section A are compulsory." />
          {[PBV2_REPO[3], PBV2_REPO[4], PBV2_REPO[3], PBV2_REPO[4], PBV2_REPO[3], PBV2_REPO[4]].map((q, i) => (
            <PaperQuestion key={i} n={i + 1} q={{ ...q, marks: 1, body: q.body }} />
          ))}

          <SectionHead letter="B" name="Short answer · 3 marks each" count={6} marks={18} />
          <SectionInstructions text="Section B contains short-answer questions. Internal choice provided in 2 questions." />
          <PaperQuestion n={7} q={PBV2_REPO[0]} />
          <PaperQuestion n={8} q={PBV2_REPO[5]} />
          <PaperQuestion n={9} q={PBV2_REPO[0]} choice={PBV2_REPO[5]} />
          <PaperQuestion n={10} q={PBV2_REPO[5]} />
          <PaperQuestion n={11} q={PBV2_REPO[0]} />
          <PaperQuestion n={12} q={PBV2_REPO[5]} choice={PBV2_REPO[0]} />

          <SectionHead letter="C" name="Long answer · 5 marks each" count={4} marks={20} />
          <SectionInstructions text="Section C contains long-answer questions. Show all working." />
          <PaperQuestion n={13} q={PBV2_REPO[1]} />
          <PaperQuestion n={14} q={PBV2_REPO[2]} />
          <PaperQuestion n={15} q={PBV2_REPO[6]} />
          <PaperQuestion n={16} q={PBV2_REPO[7]} />

          <div style={{ marginTop: 32, textAlign: "center", paddingTop: 18, borderTop: "1px solid var(--pc-line)" }}>
            <span className="pc-serif" style={{ fontStyle: "italic", fontSize: 13, color: "var(--pc-ink-3)" }}>— End of paper —</span>
          </div>
        </PaperCanvas>
        <PaperInsights status="Ready for review" statusTone="is-success" ready
          marks={44} duration={172} questions={16}
          diffEasy={5} diffMed={8} diffHard={3}
          sectionA={6} sectionB={6} sectionC={4} />
      </div>
    </PBShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ⑤ PREVIEW — Full-bleed paper, focus mode
// ═══════════════════════════════════════════════════════════════════════════

const PBV2Preview = () => (
  <PBShell toolbarProps={{ saved: "Preview mode", status: "Ready", showSubmit: false }}>
    <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Preview chrome bar */}
      <div style={{
        background: "#1A1D24", color: "#F4F4F0", padding: "10px 22px",
        display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <Icon name="eye" size={14} style={{ color: "#9AA3B0" }} />
        <span style={{ fontSize: 12, fontWeight: 500 }}>Preview mode</span>
        <span style={{ fontSize: 11.5, color: "#9AA3B0" }}>This is exactly how the paper will print.</span>
        <span style={{ flex: 1 }} />
        {/* Page chooser */}
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.08)", borderRadius: 7, padding: 2 }}>
          {["Page 1", "Page 2"].map((p, i) => (
            <button key={p} style={{
              height: 26, padding: "0 10px", border: 0, borderRadius: 5,
              background: i === 0 ? "rgba(255,255,255,0.12)" : "transparent",
              color: i === 0 ? "white" : "#9AA3B0", cursor: "pointer", fontSize: 11.5, fontFamily: "var(--pc-sans)",
            }}>{p}</button>
          ))}
        </div>
        {/* Zoom */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", borderRadius: 7, padding: "0 8px", height: 30 }}>
          <button style={{ background: "transparent", border: 0, color: "#9AA3B0", cursor: "pointer", padding: 4 }}><Icon name="minus" size={12} /></button>
          <span className="pc-num" style={{ fontSize: 11.5 }}>100%</span>
          <button style={{ background: "transparent", border: 0, color: "#9AA3B0", cursor: "pointer", padding: 4 }}><Icon name="plus" size={12} /></button>
        </div>
        <button className="pc-btn is-sm" style={{ background: "white" }}><Icon name="download" size={12} />Export PDF</button>
        <button className="pc-btn is-sm" style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "none" }}>Exit preview</button>
      </div>

      <PaperCanvas focusMode>
        <PaperHeader />
        <GeneralInstructions />

        <SectionHead letter="A" name="Compulsory · 1 mark each" count={6} marks={6} />
        <SectionInstructions text="All questions in Section A are compulsory." />
        {[PBV2_REPO[3], PBV2_REPO[4]].map((q, i) => (
          <PaperQuestion key={i} n={i + 1} q={{ ...q, marks: 1 }} />
        ))}
        <div style={{ marginTop: 12, fontSize: 11, color: "var(--pc-ink-4)", textAlign: "center", fontStyle: "italic" }} className="pc-serif">… 4 more 1-mark questions …</div>

        <SectionHead letter="B" name="Short answer · 3 marks each" count={6} marks={18} />
        <SectionInstructions text="Section B contains short-answer questions. Internal choice provided in 2 questions." />
        <PaperQuestion n={7} q={PBV2_REPO[0]} />
        <PaperQuestion n={8} q={PBV2_REPO[5]} />
        <PaperQuestion n={9} q={PBV2_REPO[0]} choice={PBV2_REPO[5]} />

        <SectionHead letter="C" name="Long answer · 5 marks each" count={4} marks={20} />
        <SectionInstructions text="Section C contains long-answer questions. Show all working." />
        <PaperQuestion n={13} q={PBV2_REPO[1]} />
        <PaperQuestion n={14} q={PBV2_REPO[2]} />

        <div style={{ marginTop: 32, paddingTop: 14, borderTop: "1px dashed var(--pc-line)", display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--pc-ink-4)" }}>
          <span>Half-Yearly · 2025–26</span>
          <span>Page 1 of 2</span>
        </div>
      </PaperCanvas>
    </div>
  </PBShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ⑥ SUBMIT — Submit-for-approval modal over the complete state
// ═══════════════════════════════════════════════════════════════════════════

const PBV2Submit = () => (
  <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <PBV2Complete />
    <div style={{ position: "absolute", inset: 0, background: "rgba(20,22,26,0.42)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", display: "grid", placeItems: "center", zIndex: 20 }}>
      <div style={{ width: 580, background: "var(--pc-surface)", borderRadius: 16, border: "1px solid var(--pc-line)", boxShadow: "var(--pc-shadow-lg)", overflow: "hidden" }}>
        <div style={{ padding: "22px 26px 16px", borderBottom: "1px solid var(--pc-line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg, #2A47CC, #6789FF)", color: "white", display: "grid", placeItems: "center", boxShadow: "0 4px 10px -2px rgba(53,92,255,0.45)" }}>
              <Icon name="play" size={16} />
            </span>
            <div>
              <h3 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>Submit for approval</h3>
              <div style={{ fontSize: 12, color: "var(--pc-ink-3)", marginTop: 2 }}>Your paper is ready. Pick a reviewer to start the approval flow.</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 26px" }}>
          {/* Snapshot */}
          <div style={{ background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
            <div className="pc-serif" style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.012em" }}>Class X · Mathematics · Half-Yearly 2025–26</div>
            <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11.5, color: "var(--pc-ink-3)", flexWrap: "wrap" }}>
              <span><span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>16</span> questions</span>
              <span><span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>44</span> marks</span>
              <span><span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>172</span> min est.</span>
              <span>Sections A · B · C</span>
              <span className="pc-tag is-success" style={{ height: 18, fontSize: 10 }}>Ready</span>
            </div>
          </div>

          {/* Reviewer */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Reviewer</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["AK", "is-blue",  "Aarav Kapoor",      "Vice Principal · Admin",   "Usually responds in 3 hr", true],
                ["PM", "is-rose",  "Priya Menon",       "Head · Mathematics",       "Responds in ~1 day",       false],
                ["RB", "is-teal",  "Rohit Banerjee",    "Math · Section X-B",       "Responds in 6 hr",         false],
              ].map(([init, av, name, role, sla, sel]) => (
                <label key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 9, border: "1px solid " + (sel ? "var(--pc-primary)" : "var(--pc-line)"), background: sel ? "var(--pc-primary-50)" : "var(--pc-surface)", boxShadow: sel ? "0 0 0 3px rgba(53,92,255,0.12)" : "none", cursor: "pointer" }}>
                  <span style={{ width: 16, height: 16, borderRadius: 999, border: sel ? "5px solid var(--pc-primary)" : "1.5px solid var(--pc-line-2)", flexShrink: 0 }} />
                  <span className={"pc-avatar " + av} style={{ width: 28, height: 28, fontSize: 11.5 }}>{init}</span>
                  <div style={{ flex: 1, lineHeight: 1.25 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--pc-ink)" }}>{name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>{role}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{sla}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Note to reviewer <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--pc-ink-5)" }}>optional</span></span>
            <textarea rows={3} placeholder="Anything they should look at first?"
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", fontSize: 12.5, fontFamily: "var(--pc-sans)", color: "var(--pc-ink)", outline: "none", boxShadow: "var(--pc-shadow-xs)", resize: "vertical" }} />
          </label>
        </div>

        <div style={{ padding: "14px 26px 20px", borderTop: "1px solid var(--pc-line)", display: "flex", gap: 8 }}>
          <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)", alignSelf: "center" }}>You'll be notified when Aarav responds.</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="pc-btn">Cancel</button>
            <button className="pc-btn is-primary"><Icon name="play" size={13} />Submit to Aarav</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { PBV2Start, PBV2Empty, PBV2Composing, PBV2Complete, PBV2Preview, PBV2Submit });
