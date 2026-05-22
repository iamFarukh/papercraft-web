// GenerateFlow.jsx — Teacher Generate Paper Flow (mid-step view)
// Shows step 5 of 9: Select Chapters + difficulty config in context.

const StepDot = ({ n, label, state }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
    <div style={{
      width: 26, height: 26, borderRadius: 13,
      background: state === "done" ? "var(--pc-primary)" : state === "current" ? "white" : "var(--pc-surface)",
      border: state === "current" ? "2px solid var(--pc-primary)" : state === "done" ? "2px solid var(--pc-primary)" : "1px solid var(--pc-line)",
      color: state === "done" ? "white" : state === "current" ? "var(--pc-primary)" : "var(--pc-ink-4)",
      display: "grid", placeItems: "center",
      fontFamily: "var(--pc-serif)", fontSize: 12, fontWeight: 500,
      boxShadow: state === "current" ? "0 0 0 4px rgba(53,92,255,0.12)" : "none",
      transition: "all .2s",
    }}>
      {state === "done" ? <Icon name="check" size={12} stroke={2.6} /> : n}
    </div>
    <span style={{ fontSize: 10.5, color: state === "current" ? "var(--pc-ink)" : "var(--pc-ink-4)", fontWeight: state === "current" ? 500 : 400, whiteSpace: "nowrap" }}>{label}</span>
  </div>
);

const ChapterChoice = ({ name, count, selected, onClick, focus, target }) => (
  <div onClick={onClick} style={{
    background: "var(--pc-surface)",
    border: "1px solid " + (selected ? "var(--pc-primary)" : "var(--pc-line)"),
    borderRadius: 10,
    padding: "12px 14px",
    boxShadow: selected ? "0 0 0 3px rgba(53,92,255,0.12), var(--pc-shadow-xs)" : "var(--pc-shadow-xs)",
    cursor: "pointer",
    display: "flex", flexDirection: "column", gap: 6,
    position: "relative",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, background: selected ? "var(--pc-primary)" : "transparent", border: selected ? "none" : "1px solid var(--pc-line-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        {selected && <Icon name="check" size={10} stroke={2.8} style={{ color: "white" }} />}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--pc-ink)" }}>{name}</span>
      {focus && <span className="pc-tag is-warning" style={{ marginLeft: "auto", height: 17, fontSize: 9.5 }}>focus</span>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}><span className="pc-num">{count}</span> questions in bank</span>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 10.5, color: "var(--pc-ink-3)" }}>target <span className="pc-num" style={{ color: "var(--pc-ink)", fontWeight: 500 }}>{target}</span> marks</span>
    </div>
    {selected && (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div className="pc-bar is-primary" style={{ flex: 1, height: 4 }}><span style={{ width: Math.min(100, (target/16)*100) + "%" }} /></div>
      </div>
    )}
  </div>
);

const DifficultySlider = ({ label, color, value, target }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 12, color: "var(--pc-ink-2)", fontWeight: 500 }}>{label}</span>
      <span style={{ flex: 1 }} />
      <span className="pc-num" style={{ fontSize: 12, color: "var(--pc-ink)", fontWeight: 500 }}>{value}%</span>
      <span style={{ fontSize: 10, color: "var(--pc-ink-4)" }}>· target {target}%</span>
    </div>
    <div style={{ position: "relative", height: 16 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 7, height: 4, borderRadius: 2, background: "var(--pc-surface-3)" }} />
      <div style={{ position: "absolute", left: 0, top: 7, width: value + "%", height: 4, borderRadius: 2, background: color }} />
      <div style={{ position: "absolute", left: `calc(${target}% - 1px)`, top: 3, width: 2, height: 12, background: "var(--pc-ink-3)", borderRadius: 1 }} title="blueprint target" />
      <div style={{ position: "absolute", left: `calc(${value}% - 8px)`, top: 0, width: 16, height: 16, borderRadius: 8, background: "white", border: "2px solid " + color, boxShadow: "var(--pc-shadow-xs)", cursor: "grab" }} />
    </div>
  </div>
);

const GenerateFlow = () => {
  return (
    <div className="pc-screen">
      <div className="pc-shell">
        <Sidebar role="teacher" active="gen" items={TEACHER_NAV}
          footName="Priya Nair" footRole="Mathematics · Class X &amp; XII" footAvatar="PN" footAvatarClass="is-rose" />
        <div className="pc-work">
          <Topbar
            crumbs={["Compose", "Generate Paper", <span className="pc-serif" style={{ fontStyle: "italic", color: "var(--pc-ink-3)" }}>untitled draft · auto-saving</span>]}
            actions={<>
              <button className="pc-btn is-ghost"><Icon name="history" size={14} />Versions</button>
              <button className="pc-btn"><Icon name="archive" size={14} />Save Draft</button>
            </>}
          />

          <div className="pc-scroll" style={{ flex: 1, padding: "26px 36px 32px", background: "var(--pc-bg)", overflow: "auto" }}>
            {/* Hero */}
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Compose · Step 5 of 9</div>
              <h1 className="pc-serif" style={{ fontSize: 30, fontWeight: 500, margin: 0, letterSpacing: "-0.026em", lineHeight: 1.1 }}>
                Choose the chapters <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>and how heavily each should weigh.</span>
              </h1>
              <p style={{ fontSize: 13, color: "var(--pc-ink-3)", margin: "8px 0 0", maxWidth: 640, lineHeight: 1.55 }}>
                The active blueprint, <em>Class X · Half-Yearly · Standard</em>, suggests a default. You can adjust — Composer keeps the paper balanced as you go.
              </p>

              {/* Stepper */}
              <div className="pc-panel" style={{ marginTop: 22, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, position: "relative" }}>
                  <div style={{ position: "absolute", top: 13, left: 26, right: 26, height: 2, background: "var(--pc-line)", zIndex: 0 }}>
                    <div style={{ width: "50%", height: "100%", background: "var(--pc-primary)" }} />
                  </div>
                  {[
                    ["1", "Class", "done"],
                    ["2", "Subject", "done"],
                    ["3", "Exam Type", "done"],
                    ["4", "Blueprint", "done"],
                    ["5", "Chapters", "current"],
                    ["6", "Difficulty", "todo"],
                    ["7", "Build", "todo"],
                    ["8", "Review", "todo"],
                    ["9", "Submit", "todo"],
                  ].map(([n,l,s], i) => (
                    <div key={n} style={{ position: "relative", zIndex: 1 }}><StepDot n={n} label={l} state={s} /></div>
                  ))}
                </div>
              </div>

              {/* Summary of choices so far */}
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {[
                  ["Class", "X"],
                  ["Subject", "Mathematics"],
                  ["Exam type", "Half-Yearly"],
                  ["Blueprint", "Standard · 80 marks · 3 hrs"],
                ].map(([k,v]) => (
                  <div key={k} style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 999, padding: "5px 4px 5px 12px", display: "flex", alignItems: "center", gap: 8, boxShadow: "var(--pc-shadow-xs)" }}>
                    <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
                    <button style={{ width: 20, height: 20, border: 0, background: "transparent", color: "var(--pc-ink-4)", cursor: "pointer", borderRadius: 4 }}><Icon name="edit" size={11} /></button>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, marginTop: 22 }}>
                {/* LEFT — Chapter choice + difficulty */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="pc-panel pc-panel-pad">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <h2 className="pc-serif" style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>Chapters in scope</h2>
                        <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Tap to include · adjust target marks per chapter</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="pc-btn is-sm">Select all</button>
                        <button className="pc-btn is-sm is-ghost">Clear</button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <ChapterChoice name="Real Numbers" count={48} selected target={6} />
                      <ChapterChoice name="Polynomials" count={36} selected target={6} />
                      <ChapterChoice name="Quadratic Equations" count={29} selected focus target={10} />
                      <ChapterChoice name="Arithmetic Progressions" count={24} selected target={8} />
                      <ChapterChoice name="Triangles" count={32} selected={false} target={6} />
                      <ChapterChoice name="Coordinate Geometry" count={14} selected target={6} />
                      <ChapterChoice name="Trigonometry" count={22} selected focus target={12} />
                      <ChapterChoice name="Statistics" count={8} selected target={12} />
                    </div>
                  </div>

                  <div className="pc-panel pc-panel-pad">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <h2 className="pc-serif" style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>Difficulty mix</h2>
                        <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Slide to set your preferences · tick marks show blueprint targets</div>
                      </div>
                      <button className="pc-btn is-sm"><Icon name="sparkles" size={11} />Reset to blueprint</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 4px 0" }}>
                      <DifficultySlider label="Easy" color="var(--pc-success)" value={28} target={30} />
                      <DifficultySlider label="Medium" color="var(--pc-primary)" value={44} target={40} />
                      <DifficultySlider label="Hard" color="var(--pc-warning)" value={22} target={22} />
                      <DifficultySlider label="HOTS" color="var(--pc-danger)" value={6} target={8} />
                    </div>
                  </div>
                </div>

                {/* RIGHT — Live preview / blueprint */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="pc-panel pc-panel-pad" style={{ background: "var(--pc-panel-gradient)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Icon name="target" size={14} style={{ color: "var(--pc-primary)" }} />
                      <h3 className="pc-serif" style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Blueprint snapshot</h3>
                    </div>
                    <p className="pc-serif" style={{ fontStyle: "italic", fontSize: 11.5, color: "var(--pc-ink-3)", margin: "2px 0 12px" }}>Class X · Half-Yearly · Standard</p>
                    {[
                      ["Section A · MCQ", "20 × 1 = 20"],
                      ["Section B · VSA", "5 × 2 = 10"],
                      ["Section C · SA", "6 × 3 = 18"],
                      ["Section D · LA", "4 × 5 = 20"],
                      ["Section E · Case", "3 × 4 = 12"],
                    ].map(([s, m]) => (
                      <div key={s} style={{ display: "flex", padding: "4px 0", fontSize: 12 }}>
                        <span style={{ color: "var(--pc-ink-2)" }}>{s}</span>
                        <span style={{ marginLeft: "auto", color: "var(--pc-ink-3)" }} className="pc-num">{m}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", padding: "8px 0 0", marginTop: 6, borderTop: "1px solid var(--pc-line)", fontSize: 13, fontWeight: 500 }}>
                      <span>Total</span>
                      <span style={{ marginLeft: "auto" }} className="pc-num">80 marks · 3 hrs</span>
                    </div>
                  </div>

                  <div className="pc-panel pc-panel-pad">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <h3 className="pc-serif" style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Live coverage</h3>
                      <span className="pc-tag is-success">balanced</span>
                    </div>
                    <div style={{ position: "relative", height: 100, display: "grid", placeItems: "center", marginBottom: 8 }}>
                      <svg width="100%" height="100" viewBox="0 0 200 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="var(--pc-primary)" stopOpacity="0.35"/>
                            <stop offset="1" stopColor="var(--pc-primary)" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path d="M0,70 C30,40 60,55 80,38 C100,22 130,30 160,18 C175,12 190,16 200,12 L200,100 L0,100 Z" fill="url(#g1)" />
                        <path d="M0,70 C30,40 60,55 80,38 C100,22 130,30 160,18 C175,12 190,16 200,12" fill="none" stroke="var(--pc-primary)" strokeWidth="1.6" />
                        {/* tick markers */}
                        {[20, 50, 80, 110, 140, 170].map((x,i) => <circle key={i} cx={x} cy={[50, 47, 36, 25, 22, 17][i]} r="2.5" fill="white" stroke="var(--pc-primary)" strokeWidth="1.4" />)}
                      </svg>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", lineHeight: 1.5 }}>
                      <span className="pc-num" style={{ color: "var(--pc-ink)", fontWeight: 500 }}>72</span> of <span className="pc-num">80</span> blueprint points satisfied with current choices. Statistics needs one more question.
                    </div>
                  </div>

                  <div className="pc-panel pc-panel-pad" style={{ background: "linear-gradient(180deg, var(--pc-info-panel-from), var(--pc-info-panel-to))", border: "1px solid var(--pc-info-panel-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: "var(--pc-brand-gradient)", color: "white", display: "grid", placeItems: "center" }}>
                        <Icon name="sparkles" size={11} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pc-primary-ink)" }}>Composer is ready</span>
                    </div>
                    <p style={{ fontSize: 11.5, color: "var(--pc-info-panel-text)", margin: "0 0 10px", lineHeight: 1.5 }}>
                      Skip ahead — Composer will pick balanced questions for these chapters and you can edit anything in the canvas.
                    </p>
                    <button className="pc-btn is-primary" style={{ width: "100%", justifyContent: "center" }}><Icon name="sparkles" size={12} />Auto-generate paper</button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 10, padding: "16px 0", borderTop: "1px solid var(--pc-line)" }}>
                <button className="pc-btn"><Icon name="arrowLeft" size={13} />Back to Blueprint</button>
                <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: "var(--pc-ink-4)" }}>auto-saved · just now</span>
                <button className="pc-btn is-primary is-lg">Continue to Difficulty <Icon name="arrowRight" size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.GenerateFlow = GenerateFlow;
