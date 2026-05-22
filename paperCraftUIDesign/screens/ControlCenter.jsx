// ControlCenter.jsx — Admin "Academic Mission Control"
// Hero overview, approval pipeline, academic health, activity feed.

const PipelineCol = ({ name, count, items, accent }) => (
  <div className="pc-pipe-col">
    <div className="pc-pipe-col-head">
      <span className="pc-pipe-col-name">{name}</span>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: accent }} />
    </div>
    <div className="pc-pipe-col-count">{count}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
      {items.map((it, i) => (
        <div key={i} style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 8, padding: "8px 10px", boxShadow: "var(--pc-shadow-xs)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--pc-ink)", lineHeight: 1.3 }}>{it.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
            <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{it.meta}</span>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--pc-ink-3)" }}>
              <span className={"pc-avatar " + it.av} style={{ width: 16, height: 16, fontSize: 8.5 }}>{it.initials}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ChapterCoverageBar = ({ name, pct, count, status }) => (
  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 70px 16px", alignItems: "center", gap: 12, padding: "8px 0" }}>
    <span style={{ fontSize: 12.5, color: "var(--pc-ink-2)" }}>{name}</span>
    <div className={"pc-bar " + (pct >= 80 ? "is-success" : pct >= 50 ? "is-primary" : "is-warning")}>
      <span style={{ width: pct + "%" }} />
    </div>
    <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)", textAlign: "right" }} className="pc-num">{pct}% · {count}</span>
    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: status }} />
  </div>
);

const FeedItem = ({ avatar, av, name, action, target, time, tag, tagTone }) => (
  <div style={{ display: "flex", gap: 11, padding: "11px 0", borderBottom: "1px solid var(--pc-line)" }}>
    <div className={"pc-avatar " + av} style={{ width: 26, height: 26, fontSize: 11 }}>{avatar}</div>
    <div style={{ flex: 1, lineHeight: 1.4 }}>
      <div style={{ fontSize: 12.5, color: "var(--pc-ink-2)" }}>
        <strong style={{ color: "var(--pc-ink)", fontWeight: 500 }}>{name}</strong> {action} <span style={{ color: "var(--pc-ink)", fontWeight: 500 }}>{target}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
        <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{time}</span>
        {tag && <span className={"pc-tag " + (tagTone || "")}>{tag}</span>}
      </div>
    </div>
  </div>
);

const ControlCenter = () => {
  return (
    <div className="pc-screen">
      <div className="pc-shell">
        <Sidebar role="admin" active="home" items={ADMIN_NAV}
          footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
        <div className="pc-work">
          <Topbar
            crumbs={["Saraswati Vidya Niketan", "Control Center"]}
            actions={<>
              <button className="pc-btn"><Icon name="upload" size={14} />Bulk Import</button>
              <button className="pc-btn is-primary"><Icon name="plus" size={14} />New Paper</button>
            </>}
          />
          <div className="pc-scroll" style={{ flex: 1, padding: "24px 28px 32px", background: "var(--pc-bg)" }}>
            {/* Hero */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 6 }}>Tuesday · 21 May 2026 · Term&nbsp;II in progress</div>
                <h1 className="pc-serif" style={{ fontSize: 34, fontWeight: 500, margin: 0, letterSpacing: "-0.028em", lineHeight: 1.1 }}>
                  Good morning, Aarav.
                  <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}> Seven papers await your review.</span>
                </h1>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="pc-btn"><Icon name="eye" size={14} />View as Teacher</button>
                <button className="pc-btn"><Icon name="sliders" size={14} />Configure</button>
              </div>
            </div>

            {/* Top stats row */}
            <div className="pc-panel" style={{ padding: "20px 24px", marginBottom: 20, display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 1fr 1.1fr", gap: 28 }}>
              <Stat label="Pending Approvals" value="7" hint="3 high priority · Class X & XII"
                trend={<div style={{ height: 24, color: "var(--pc-warning)" }}><Spark color="var(--pc-warning)" points={[4,5,4,6,5,7,6,8,7,7]} height={24} /></div>} />
              <Stat label="Active Teachers" value="42" unit="/ 48" hint="6 inactive this week"
                trend={<div style={{ height: 24 }}><Spark points={[38,39,40,40,41,41,42,42,42,42]} height={24} /></div>} />
              <Stat label="Papers This Month" value="128" hint="↑ 12% vs April"
                trend={<div style={{ height: 24 }}><Spark color="var(--pc-success)" points={[80,90,95,100,110,115,118,122,125,128]} height={24} /></div>} />
              <Stat label="Question Bank" value="3,412" hint="42 added this week"
                trend={<div style={{ height: 24 }}><Spark points={[3200,3240,3260,3280,3300,3340,3360,3380,3395,3412]} height={24} /></div>} />
              <div>
                <span style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>Quality Index</span>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
                  <div className="pc-radial" style={{ "--p": 84 }}><span>84</span></div>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ fontSize: 11.5, color: "var(--pc-ink-2)" }}>AI-assessed across<br/>blueprint match, balance,<br/>duplicates &amp; readability.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 20 }}>
              {/* Approval pipeline + Academic health */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Pipeline */}
                <div className="pc-panel pc-panel-pad">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <h2 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Approval Pipeline</h2>
                      <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginTop: 2 }}>Term II · all examinations</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="pc-btn is-sm is-ghost"><Icon name="filter" size={12} />Subject</button>
                      <button className="pc-btn is-sm is-ghost">View board <Icon name="arrowRight" size={12} /></button>
                    </div>
                  </div>
                  <div className="pc-pipe">
                    <PipelineCol name="Draft" count={14} accent="var(--pc-ink-5)" items={[
                      { title: "Mathematics · Class X · Half-Yearly", meta: "Set A · 80 marks", av: "is-rose", initials: "PN" },
                      { title: "Science · Class VIII · Unit Test", meta: "Set 1 · 40 marks", av: "is-teal", initials: "RV" },
                    ]} />
                    <PipelineCol name="Submitted" count={7} accent="var(--pc-primary)" items={[
                      { title: "Mathematics · Class XII · Pre-Board", meta: "Set A · 80 marks · 2h ago", av: "is-rose", initials: "PN" },
                      { title: "Physics · Class XI · Mid-Term", meta: "Set 2 · 70 marks · 4h ago", av: "is-violet", initials: "SI" },
                      { title: "English · Class IX · Half-Yearly", meta: "Set 1 · 80 marks · today", av: "is-amber", initials: "MD" },
                    ]} />
                    <PipelineCol name="In Review" count={4} accent="var(--pc-warning)" items={[
                      { title: "Chemistry · Class XII · Pre-Board", meta: "Set B · being reviewed", av: "is-blue", initials: "AK" },
                      { title: "Hindi · Class X · Half-Yearly", meta: "Revisions requested", av: "is-blue", initials: "AK" },
                    ]} />
                    <PipelineCol name="Approved" count={9} accent="var(--pc-success)" items={[
                      { title: "Mathematics · Class IX · Half-Yearly", meta: "Approved · yesterday", av: "is-blue", initials: "AK" },
                      { title: "Biology · Class XI · Mid-Term", meta: "Approved · 2 days ago", av: "is-blue", initials: "AK" },
                    ]} />
                    <PipelineCol name="Locked" count={32} accent="var(--pc-ink)" items={[
                      { title: "Mathematics · Class X · Mid-Term", meta: "Locked & exported · printed", av: "is-blue", initials: "AK" },
                    ]} />
                  </div>
                </div>

                {/* Health */}
                <div className="pc-panel pc-panel-pad">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <h2 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Academic Health</h2>
                      <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginTop: 2 }}>Mathematics · Class X · syllabus coverage</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span className="pc-tag is-outline">Class X</span>
                      <span className="pc-tag is-primary">Mathematics</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, paddingTop: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--pc-ink-4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Chapter coverage</div>
                      <ChapterCoverageBar name="Real Numbers" pct={92} count="48 q" status="var(--pc-success)" />
                      <ChapterCoverageBar name="Polynomials" pct={78} count="36 q" status="var(--pc-success)" />
                      <ChapterCoverageBar name="Quadratic Eq." pct={64} count="29 q" status="var(--pc-primary)" />
                      <ChapterCoverageBar name="Trigonometry" pct={48} count="22 q" status="var(--pc-primary)" />
                      <ChapterCoverageBar name="Coord. Geometry" pct={31} count="14 q" status="var(--pc-warning)" />
                      <ChapterCoverageBar name="Statistics" pct={18} count="8 q" status="var(--pc-danger)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--pc-ink-4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Difficulty mix · current term</div>
                      {/* Donut */}
                      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                        <svg width="140" height="140" viewBox="0 0 42 42">
                          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--pc-surface-3)" strokeWidth="6"/>
                          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--pc-success)" strokeWidth="6" strokeDasharray="32 100" strokeDashoffset="25" />
                          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--pc-primary)" strokeWidth="6" strokeDasharray="44 100" strokeDashoffset="-7" />
                          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--pc-warning)" strokeWidth="6" strokeDasharray="18 100" strokeDashoffset="-51" />
                          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--pc-danger)" strokeWidth="6" strokeDasharray="6 100" strokeDashoffset="-69" />
                          <text x="21" y="22" textAnchor="middle" dominantBaseline="middle" fontFamily="Newsreader, serif" fontSize="6.5" fill="var(--pc-ink)">balanced</text>
                        </svg>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--pc-success)" }} /><span style={{ color: "var(--pc-ink-2)" }}>Easy</span><span className="pc-num" style={{ color: "var(--pc-ink-4)", marginLeft: "auto" }}>32%</span></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--pc-primary)" }} /><span style={{ color: "var(--pc-ink-2)" }}>Medium</span><span className="pc-num" style={{ color: "var(--pc-ink-4)", marginLeft: "auto" }}>44%</span></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--pc-warning)" }} /><span style={{ color: "var(--pc-ink-2)" }}>Hard</span><span className="pc-num" style={{ color: "var(--pc-ink-4)", marginLeft: "auto" }}>18%</span></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--pc-danger)" }} /><span style={{ color: "var(--pc-ink-2)" }}>HOTS</span><span className="pc-num" style={{ color: "var(--pc-ink-4)", marginLeft: "auto" }}>6%</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side col: AI Insights + Feed */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* AI Insights */}
                <div className="pc-panel pc-panel-pad" style={{ background: "var(--pc-panel-gradient)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--pc-brand-gradient)", color: "white", display: "grid", placeItems: "center", boxShadow: "0 2px 6px rgba(53,92,255,0.4)" }}>
                        <Icon name="sparkles" size={12} />
                      </div>
                      <h2 className="pc-serif" style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>Composer Insights</h2>
                    </div>
                    <span className="pc-tag is-primary" style={{ fontSize: 10 }}>quiet</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--pc-ink-3)", margin: "4px 0 14px", fontStyle: "italic" }} className="pc-serif">
                    Three observations from this week's question bank activity.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { title: "Statistics under-covered in Class X", body: "Only 8 questions across 4 topics. Target ≥ 25 for blueprint balance.", icon: "warn", tone: "var(--pc-warning)" },
                      { title: "Three near-duplicates in Trigonometry", body: "Q-1042, Q-1058 and Q-2210 share ≥ 86% similarity. Consider merging.", icon: "info", tone: "var(--pc-primary)" },
                      { title: "HOTS gap across Class XII Physics", body: "Last 4 mid-term papers used the same 6 HOTS items.", icon: "flame", tone: "var(--pc-danger)" },
                    ].map((x, i) => (
                      <div key={i} style={{ display: "flex", gap: 11 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: x.tone + "1F", color: x.tone, display: "grid", placeItems: "center", flexShrink: 0 }}>
                          <Icon name={x.icon} size={13} />
                        </div>
                        <div style={{ lineHeight: 1.4 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>{x.title}</div>
                          <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)" }}>{x.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="pc-btn is-sm" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>Open insights board</button>
                </div>

                {/* Feed */}
                <div className="pc-panel pc-panel-pad" style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <h2 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Operational Feed</h2>
                    <button className="pc-btn is-sm is-ghost">All <Icon name="chev" size={12} /></button>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <FeedItem avatar="PN" av="is-rose" name="Priya Nair" action="submitted" target="Class XII · Pre-Board · Set A" time="11 minutes ago" tag="awaiting review" tagTone="is-primary" />
                    <FeedItem avatar="SI" av="is-violet" name="Sahil Iyer" action="uploaded 18 questions to" target="Quadratic Eq. · Class X" time="42 minutes ago" tag="bulk import" tagTone="" />
                    <FeedItem avatar="AK" av="is-blue" name="You" action="approved" target="Mathematics · Class IX · Half-Yearly" time="2 hours ago" tag="approved" tagTone="is-success" />
                    <FeedItem avatar="MD" av="is-amber" name="Meera Das" action="requested revisions on" target="English · Class IX · Half-Yearly" time="3 hours ago" tag="revisions" tagTone="is-warning" />
                    <FeedItem avatar="RV" av="is-teal" name="Rohan V." action="locked" target="Class X · Mid-Term · printed" time="yesterday" tag="locked" tagTone="is-ink" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.ControlCenter = ControlCenter;
