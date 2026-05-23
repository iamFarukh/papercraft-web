// Curriculum.jsx — Curriculum Workspace (Class → Subject → Chapter → Topic tree)

const TreeRow = ({ depth, type, name, count, completion, status, selected, expanded, onClick, indicator, badges }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 16px 10px " + (16 + depth * 18) + "px",
    background: selected ? "var(--pc-primary-50)" : "transparent",
    borderLeft: "2px solid " + (selected ? "var(--pc-primary)" : "transparent"),
    cursor: "pointer",
    borderBottom: "1px solid var(--pc-line)",
    position: "relative",
  }}>
    <span style={{ color: "var(--pc-ink-5)", width: 14, display: "grid", placeItems: "center", flexShrink: 0 }}>
      {depth < 3 && <Icon name="chev" size={12} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s" }} />}
    </span>
    <span style={{ width: 18, height: 18, borderRadius: 4, background: type === "class" ? "var(--pc-primary-50)" : type === "subject" ? "var(--pc-surface-3)" : "transparent", color: type === "class" ? "var(--pc-primary)" : type === "subject" ? "var(--pc-ink-3)" : "var(--pc-ink-4)", display: "grid", placeItems: "center", flexShrink: 0 }}>
      <Icon name={type === "class" ? "users" : type === "subject" ? "book" : type === "chapter" ? "layers" : "file"} size={11} />
    </span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span className={depth === 0 ? "pc-serif" : ""} style={{ fontSize: depth === 0 ? 14.5 : depth === 1 ? 13 : 12.5, fontWeight: depth <= 1 ? 500 : 400, color: "var(--pc-ink)", letterSpacing: depth === 0 ? "-0.005em" : 0 }}>{name}</span>
        {badges && badges.map((b, i) => <span key={i} className={"pc-tag " + b.tone} style={{ height: 17, fontSize: 9.5 }}>{b.label}</span>)}
      </div>
    </div>
    {completion !== undefined && (
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 110 }}>
        <div className={"pc-bar " + (completion >= 70 ? "is-success" : completion >= 40 ? "is-primary" : "is-warning")} style={{ flex: 1, height: 4 }}>
          <span style={{ width: completion + "%" }} />
        </div>
        <span style={{ fontSize: 10.5, color: "var(--pc-ink-3)", minWidth: 28, textAlign: "right" }} className="pc-num">{completion}%</span>
      </div>
    )}
    {count !== undefined && (
      <span style={{ fontSize: 11, color: "var(--pc-ink-4)", minWidth: 56, textAlign: "right" }}>
        <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{count}</span> q
      </span>
    )}
    {indicator && <span style={{ width: 8, height: 8, borderRadius: 4, background: indicator, flexShrink: 0 }} />}
    <button style={{ width: 24, height: 24, border: 0, background: "transparent", color: "var(--pc-ink-4)", cursor: "pointer", borderRadius: 4, opacity: 0.7 }}><Icon name="dots" size={13} /></button>
  </div>
);

const Curriculum = () => {
  return (
    <div className="pc-screen">
      <div className="pc-shell">
        <Sidebar role="admin" active="curriculum" items={ADMIN_NAV}
          footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
        <div className="pc-work">
          <Topbar
            crumbs={["Academic", "Curriculum", <span className="pc-serif" style={{ fontStyle: "italic", color: "var(--pc-ink-3)" }}>Class X · Mathematics</span>]}
            actions={<>
              <button className="pc-btn"><Icon name="upload" size={13} />Import Syllabus</button>
              <button className="pc-btn is-primary"><Icon name="plus" size={13} />New Chapter</button>
            </>}
          />

          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", flex: 1, minHeight: 0, background: "var(--pc-bg)" }}>
            {/* LEFT — Academic Navigator */}
            <aside style={{ borderRight: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "14px 0 18px", display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ padding: "0 16px 10px" }}>
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Academic Sessions</div>
                <div className="pc-session-pill" style={{ margin: 0, padding: "8px 10px" }}>
                  <span className="pc-session-pill-dot" />
                  <div style={{ lineHeight: 1.15 }}>
                    <div className="pc-session-pill-label">Active</div>
                    <div className="pc-session-pill-value">2025–26</div>
                  </div>
                  <span className="pc-session-pill-chev"><Icon name="chevDown" size={13} /></span>
                </div>
              </div>
              <div style={{ padding: "8px 14px 4px", fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Classes</div>
              <div className="pc-scroll" style={{ flex: 1, overflow: "auto" }}>
                {["VI","VII","VIII","IX"].map(c => (
                  <div key={c} style={{ padding: "8px 16px", fontSize: 13, color: "var(--pc-ink-2)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <Icon name="chev" size={12} style={{ color: "var(--pc-ink-5)" }} />
                    <span>Class {c}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)" }} className="pc-num">{[210,224,318,402]["VI VII VIII IX".split(" ").indexOf(c)]}</span>
                  </div>
                ))}
                <div style={{ background: "var(--pc-primary-50)", borderLeft: "2px solid var(--pc-primary)" }}>
                  <div style={{ padding: "8px 16px", fontSize: 13, color: "var(--pc-primary-ink)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 500 }}>
                    <Icon name="chevDown" size={12} />
                    <span>Class X</span>
                    <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-primary)" }} className="pc-num">512</span>
                  </div>
                  <div style={{ paddingLeft: 18 }}>
                    {[
                      ["Mathematics", 612, true],
                      ["Science", 482, false],
                      ["English", 318, false],
                      ["Hindi", 294, false],
                      ["Social Studies", 378, false],
                    ].map(([s, n, active]) => (
                      <div key={s} style={{ padding: "6px 16px 6px 18px", fontSize: 12.5, color: active ? "var(--pc-ink)" : "var(--pc-ink-3)", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: active ? 500 : 400, background: active ? "rgba(53,92,255,0.06)" : "transparent" }}>
                        <span style={{ width: 6, height: 6, borderRadius: 3, background: active ? "var(--pc-primary)" : "var(--pc-line-2)" }} />
                        <span>{s}</span>
                        <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)" }} className="pc-num">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {["XI","XII"].map(c => (
                  <div key={c} style={{ padding: "8px 16px", fontSize: 13, color: "var(--pc-ink-2)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <Icon name="chev" size={12} style={{ color: "var(--pc-ink-5)" }} />
                    <span>Class {c}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)" }} className="pc-num">{c === "XI" ? 488 : 432}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--pc-line)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                <button className="pc-btn is-sm" style={{ justifyContent: "flex-start" }}><Icon name="folder" size={11} />Blueprints</button>
                <button className="pc-btn is-sm" style={{ justifyContent: "flex-start" }}><Icon name="target" size={11} />Bloom Mapping</button>
              </div>
            </aside>

            {/* CENTER — Curriculum tree */}
            <section style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ padding: "20px 28px 14px", borderBottom: "1px solid var(--pc-line)" }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Class X · Mathematics · 2025–26</div>
                    <h1 className="pc-serif" style={{ fontSize: 26, fontWeight: 500, margin: 0, letterSpacing: "-0.024em", lineHeight: 1.1 }}>
                      14 chapters <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>· 612 questions across the syllabus</span>
                    </h1>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div className="pc-cmd" style={{ width: 200, marginLeft: 0 }}>
                      <Icon name="search" size={13} />
                      <span>Search chapters &amp; topics</span>
                    </div>
                    <button className="pc-btn"><Icon name="sliders" size={13} />Sort</button>
                  </div>
                </div>

                {/* Quick stats row */}
                <div style={{ display: "flex", gap: 22, marginTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>Coverage</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span className="pc-serif" style={{ fontSize: 20, fontWeight: 500 }}>74%</span>
                      <span style={{ fontSize: 11, color: "var(--pc-success)" }}>↑ 6%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>Topics</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span className="pc-serif" style={{ fontSize: 20, fontWeight: 500 }}>48</span>
                      <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>/ 52 planned</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>Last edit</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span className="pc-serif" style={{ fontSize: 14, fontWeight: 500, fontStyle: "italic", color: "var(--pc-ink-2)" }}>Quadratic Eq.</span>
                      <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>· 11 m ago</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button className="pc-btn is-sm">View as cards</button>
                    <button className="pc-btn is-sm" style={{ background: "var(--pc-ink)", color: "white", border: "1px solid var(--pc-ink)" }}>Tree</button>
                  </div>
                </div>
              </div>

              <div className="pc-scroll" style={{ flex: 1, overflow: "auto", background: "var(--pc-surface)" }}>
                {/* Column header */}
                <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, borderBottom: "1px solid var(--pc-line)", background: "var(--pc-surface-2)" }}>
                  <span style={{ flex: 1, paddingLeft: 32 }}>Chapter / topic</span>
                  <span style={{ minWidth: 110, textAlign: "right" }}>Completion</span>
                  <span style={{ minWidth: 56, textAlign: "right" }}>Questions</span>
                  <span style={{ width: 32 }}></span>
                </div>

                <TreeRow depth={0} type="chapter" name="1 · Real Numbers" expanded badges={[{ label: "complete", tone: "is-success" }]} completion={92} count={48} indicator="#14B87A" />
                <TreeRow depth={1} type="topic" name="Euclid's division algorithm" completion={100} count={14} />
                <TreeRow depth={1} type="topic" name="Fundamental theorem of arithmetic" completion={94} count={18} />
                <TreeRow depth={1} type="topic" name="Irrational numbers · proofs" completion={82} count={10} />
                <TreeRow depth={1} type="topic" name="Decimal expansions" completion={75} count={6} />

                <TreeRow depth={0} type="chapter" name="2 · Polynomials" expanded={false} completion={78} count={36} indicator="#14B87A" />
                <TreeRow depth={0} type="chapter" name="3 · Pair of Linear Equations" expanded={false} completion={68} count={28} indicator="#355CFF" />

                <TreeRow depth={0} type="chapter" name="4 · Quadratic Equations" expanded selected badges={[{ label: "focus chapter", tone: "is-warning" }]} completion={64} count={29} indicator="#355CFF" />
                <TreeRow depth={1} type="topic" name="Introduction · standard form" completion={88} count={6} />
                <TreeRow depth={1} type="topic" name="Solution by factorisation" completion={84} count={9} />
                <TreeRow depth={1} type="topic" name="Solution by completing the square" completion={72} count={7} />
                <TreeRow depth={1} type="topic" name="Discriminant &amp; nature of roots" completion={56} count={4} />
                <TreeRow depth={1} type="topic" name="Word problems" completion={40} count={3} indicator="#E08A1F" />

                <TreeRow depth={0} type="chapter" name="5 · Arithmetic Progressions" expanded={false} completion={62} count={24} indicator="#355CFF" />
                <TreeRow depth={0} type="chapter" name="6 · Triangles" expanded={false} completion={58} count={32} indicator="#355CFF" />
                <TreeRow depth={0} type="chapter" name="7 · Coordinate Geometry" expanded={false} completion={48} count={14} indicator="#355CFF" />
                <TreeRow depth={0} type="chapter" name="8 · Introduction to Trigonometry" expanded={false} completion={44} count={18} indicator="#E08A1F" />
                <TreeRow depth={0} type="chapter" name="9 · Some Applications of Trigonometry" expanded={false} completion={38} count={12} indicator="#E08A1F" />
                <TreeRow depth={0} type="chapter" name="10 · Circles" expanded={false} completion={34} count={10} indicator="#E08A1F" />
                <TreeRow depth={0} type="chapter" name="11 · Areas Related to Circles" expanded={false} completion={28} count={9} indicator="#E08A1F" />
                <TreeRow depth={0} type="chapter" name="12 · Surface Areas &amp; Volumes" expanded={false} completion={24} count={8} indicator="#DC4A3D" />
                <TreeRow depth={0} type="chapter" name="13 · Statistics" expanded={false} badges={[{ label: "under-covered", tone: "is-danger" }]} completion={18} count={8} indicator="#DC4A3D" />
                <TreeRow depth={0} type="chapter" name="14 · Probability" expanded={false} completion={12} count={6} indicator="#DC4A3D" />
              </div>
            </section>

            {/* RIGHT — Insights */}
            <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "18px 18px 22px", overflow: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Selected · Chapter 4</div>
                <h3 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: "2px 0 0", letterSpacing: "-0.015em" }}>
                  Quadratic Equations
                </h3>
                <p style={{ fontSize: 11.5, color: "var(--pc-ink-3)", margin: "4px 0 0" }}>5 topics · 29 questions · added Aug 2024</p>
              </div>

              <div className="pc-panel" style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Completion</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="pc-serif" style={{ fontSize: 20, fontWeight: 500 }}>64</span>
                    <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>%</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Quality</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="pc-serif" style={{ fontSize: 20, fontWeight: 500 }}>82</span>
                    <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>/ 100</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Usage</div>
                  <div className="pc-serif" style={{ fontSize: 14, fontWeight: 500 }}>23 papers</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Last paper</div>
                  <div className="pc-serif" style={{ fontSize: 13, fontStyle: "italic", fontWeight: 500 }}>HY · 2024</div>
                </div>
              </div>

              {/* Question type breakdown */}
              <div className="pc-panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 500, marginBottom: 10 }}>Question type mix</div>
                {[
                  ["MCQ", 6, 21, "#355CFF"],
                  ["Very Short", 4, 14, "#5A7BFF"],
                  ["Short Answer", 10, 34, "#14B87A"],
                  ["Long Answer", 7, 24, "#E08A1F"],
                  ["Case-Based", 2, 7, "#DC4A3D"],
                ].map(([l, n, pct, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 11.5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                    <span style={{ flex: 1, color: "var(--pc-ink-2)" }}>{l}</span>
                    <div className="pc-bar" style={{ width: 80 }}><span style={{ width: pct + "%", background: c }} /></div>
                    <span className="pc-num" style={{ minWidth: 28, textAlign: "right", color: "var(--pc-ink-3)" }}>{n}</span>
                  </div>
                ))}
              </div>

              {/* Bloom heat */}
              <div className="pc-panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 500, marginBottom: 10 }}>Bloom's heat-map</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
                  {[
                    ["Rem.", 0.85], ["Und.", 0.95], ["Apply", 0.80], ["Anal.", 0.55], ["Eval.", 0.25], ["Crt.", 0.10],
                  ].map(([l, v], i) => (
                    <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", height: 36, borderRadius: 4, background: `rgba(53,92,255,${v})` }} />
                      <span style={{ fontSize: 9.5, color: "var(--pc-ink-4)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pc-panel" style={{ padding: 14, background: "linear-gradient(180deg, #FFFFFF, #FAFAF7)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: "linear-gradient(135deg, #2A47CC, #6789FF)", color: "white", display: "grid", placeItems: "center" }}>
                    <Icon name="sparkles" size={11} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>Composer notes</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11.5, color: "var(--pc-ink-2)", lineHeight: 1.55 }}>
                  <li>Word-problems topic has only 3 questions — needs 5+ for blueprint.</li>
                  <li>Bloom mix skews toward Apply. Add 2 Analyse-level items.</li>
                  <li>No bilingual versions in <em>Discriminant</em>. Generate Hindi?</li>
                </ul>
                <button className="pc-btn is-sm" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>Open chapter editor →</button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Curriculum = Curriculum;
