// Approval.jsx — Admin Approval Workspace
// Three-column: Submission Queue · Paper Review Canvas · Validation + AI Review

const SubmissionRow = ({ active, paper, name, av, initials, when, urgent, marks, status, statusTone }) => (
  <div style={{
    padding: "12px 14px",
    background: active ? "var(--pc-surface)" : "transparent",
    borderLeft: "3px solid " + (active ? "var(--pc-primary)" : "transparent"),
    borderBottom: "1px solid var(--pc-line)",
    cursor: "pointer",
    position: "relative",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <div className="pc-serif" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--pc-ink)", letterSpacing: "-0.005em" }}>{paper}</div>
      {urgent && <span className="pc-tag is-danger" style={{ height: 18, fontSize: 9.5 }}>urgent</span>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div className={"pc-avatar " + av} style={{ width: 18, height: 18, fontSize: 9 }}>{initials}</div>
      <span style={{ fontSize: 11.5, color: "var(--pc-ink-3)" }}>{name}</span>
      <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)" }}>{when}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
      <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{marks} marks</span>
      <span style={{ flex: 1 }} />
      <span className={"pc-tag " + statusTone} style={{ height: 18, fontSize: 9.5 }}>{status}</span>
    </div>
  </div>
);

const Comment = ({ av, initials, name, when, body, tone = "default", attached, resolved }) => (
  <div style={{
    background: "var(--pc-surface)",
    border: "1px solid var(--pc-line)",
    borderLeft: "3px solid " + (tone === "request" ? "var(--pc-warning)" : tone === "praise" ? "var(--pc-success)" : "var(--pc-primary)"),
    borderRadius: 8,
    padding: 12,
    boxShadow: "var(--pc-shadow-xs)",
    opacity: resolved ? 0.65 : 1,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div className={"pc-avatar " + av} style={{ width: 20, height: 20, fontSize: 9.5 }}>{initials}</div>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pc-ink)" }}>{name}</span>
      <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{when}</span>
      {resolved && <span className="pc-tag is-success" style={{ marginLeft: "auto", height: 17, fontSize: 9.5 }}>resolved</span>}
    </div>
    <div style={{ fontSize: 12, color: "var(--pc-ink-2)", lineHeight: 1.5 }}>{body}</div>
    {attached && (
      <div style={{ marginTop: 8, padding: "6px 8px", background: "var(--pc-surface-3)", borderRadius: 5, fontSize: 11, color: "var(--pc-ink-3)" }}>
        <span className="pc-mono" style={{ color: "var(--pc-ink-4)" }}>↳ Q-{attached.id}</span> · {attached.snippet}
      </div>
    )}
  </div>
);

const Approval = () => {
  return (
    <div className="pc-screen">
      <div className="pc-shell">
        <Sidebar role="admin" active="approval" items={ADMIN_NAV}
          footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
        <div className="pc-work">
          <Topbar
            crumbs={["Papers", "Approvals", <span className="pc-serif" style={{ fontStyle: "italic", color: "var(--pc-ink-3)" }}>Class XII · Mathematics · Pre-Board · Set A</span>]}
            actions={<>
              <button className="pc-btn"><Icon name="history" size={14} />Versions</button>
              <button className="pc-btn"><Icon name="msg" size={14} />Comment</button>
              <button className="pc-btn"><Icon name="warn" size={14} />Request Revisions</button>
              <button className="pc-btn is-primary"><Icon name="check" size={14} />Approve &amp; Lock</button>
            </>}
          />

          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 320px", flex: 1, minHeight: 0, background: "var(--pc-bg)" }}>
            {/* LEFT — Submission Queue */}
            <aside style={{ borderRight: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid var(--pc-line)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 className="pc-serif" style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>Submissions</h3>
                  <span className="pc-tag is-primary">7 awaiting</span>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                  {["All","Submitted","In Review","Revisions"].map((t,i) => (
                    <button key={t} className="pc-btn is-sm" style={i === 1 ? { background: "var(--pc-ink)", color: "white", border: "1px solid var(--pc-ink)" } : { border: "1px solid transparent", background: "transparent", boxShadow: "none" }}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="pc-scroll" style={{ flex: 1, overflow: "auto" }}>
                <div style={{ padding: "8px 14px 4px", fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Today</div>
                <SubmissionRow active paper="Class XII · Pre-Board · Set A" name="Priya Nair" av="is-rose" initials="PN" when="11m ago" urgent marks="80" status="in review" statusTone="is-warning" />
                <SubmissionRow paper="Class XI · Mid-Term · Set 2" name="Sahil Iyer" av="is-violet" initials="SI" when="42m ago" marks="70" status="submitted" statusTone="is-primary" />
                <SubmissionRow paper="Class IX · Half-Yearly · Set 1" name="Meera Das" av="is-amber" initials="MD" when="3h ago" marks="80" status="submitted" statusTone="is-primary" />
                <div style={{ padding: "12px 14px 4px", fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Yesterday</div>
                <SubmissionRow paper="Class XII · Pre-Board · Set B" name="Aarav Kapoor" av="is-blue" initials="AK" when="14h ago" marks="80" status="revision sent" statusTone="is-warning" />
                <SubmissionRow paper="Class X · Half-Yearly · Set 1" name="Rohan V." av="is-teal" initials="RV" when="20h ago" marks="80" status="submitted" statusTone="is-primary" />
                <SubmissionRow paper="Class VIII · Unit Test 3" name="Priya Nair" av="is-rose" initials="PN" when="22h ago" marks="40" status="submitted" statusTone="is-primary" />
              </div>
            </aside>

            {/* CENTER — Paper Review canvas */}
            <section className="pc-scroll pc-dots" style={{ overflow: "auto", padding: "28px 0 60px", position: "relative" }}>
              {/* Paper meta strip */}
              <div className="pc-float" style={{ position: "sticky", top: 0, margin: "0 auto 22px", width: 595, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, zIndex: 4 }}>
                <div className="pc-avatar is-rose" style={{ width: 28, height: 28, fontSize: 12 }}>PN</div>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>Priya Nair · Mathematics, Class XII</div>
                  <div style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>Submitted 11 minutes ago · Version 3 · 24 questions · 80 marks</div>
                </div>
                <span style={{ flex: 1 }} />
                <span className="pc-tag is-warning"><Icon name="clock" size={10} />in review</span>
              </div>

              {/* Paper */}
              <div className="pc-paper" style={{ width: 595, minHeight: 842, padding: "44px 50px 60px", margin: "0 auto", position: "relative" }}>
                {/* Header */}
                <div style={{ textAlign: "center", paddingBottom: 14, borderBottom: "1.5px solid var(--pc-ink)" }}>
                  <div className="pc-serif" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Saraswati Vidya Niketan</div>
                  <div style={{ fontSize: 10, color: "var(--pc-ink-3)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 1 }}>Senior Secondary · Estd. 1962</div>
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
                    <span style={{ flex: 1, height: 1, background: "var(--pc-ink-4)", opacity: 0.4 }} />
                    <span className="pc-serif" style={{ fontSize: 14, fontStyle: "italic" }}>Pre-Board Examination · 2025–26</span>
                    <span style={{ flex: 1, height: 1, background: "var(--pc-ink-4)", opacity: 0.4 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 10.5, color: "var(--pc-ink-2)" }}>
                    <span><strong>Class:</strong> XII</span><span><strong>Subject:</strong> Mathematics</span>
                    <span><strong>Time:</strong> 3 hrs</span><span><strong>Max. Marks:</strong> 80</span>
                  </div>
                </div>

                {/* Section A */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "18px 0 10px", paddingBottom: 6, borderBottom: "1px dashed var(--pc-ink-4)" }}>
                  <span className="pc-serif" style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Section A <span style={{ color: "var(--pc-ink-4)", textTransform: "none", fontStyle: "italic", fontWeight: 400 }}>· Multiple Choice</span></span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 10, color: "var(--pc-ink-3)" }}>20 × 1 = 20</span>
                </div>

                {/* Question with comment highlight */}
                <div style={{ display: "flex", gap: 12, padding: "7px 0", background: "linear-gradient(90deg, rgba(224,138,31,0.10), transparent 80%)", borderRadius: 4, position: "relative" }}>
                  <span className="pc-serif" style={{ fontSize: 12, fontWeight: 500, minWidth: 22, textAlign: "right" }}>1.</span>
                  <div style={{ flex: 1 }} className="pc-serif" >
                    <span style={{ fontSize: 12, lineHeight: 1.55 }}>If <span className="pc-math">f(x) = x³ – 6x² + 11x – 6</span>, then the value of <span className="pc-math">f(2)</span> is —</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 14px", marginTop: 4, fontSize: 11.5, color: "var(--pc-ink-2)" }}>
                      <div>(a) 0</div><div>(b) 1</div>
                      <div>(c) –1</div><div>(d) 6</div>
                    </div>
                  </div>
                  <span className="pc-serif" style={{ fontSize: 11, color: "var(--pc-ink-3)", paddingTop: 2 }}>[1]</span>
                  <div style={{ position: "absolute", right: -32, top: 2, width: 22, height: 22, borderRadius: 5, background: "var(--pc-warning)", color: "white", display: "grid", placeItems: "center", boxShadow: "var(--pc-shadow-md)", fontSize: 11, fontWeight: 500 }}>2</div>
                </div>

                {[
                  ["2.", "The value of ∫ (sin²x) dx from 0 to π/2 is —", null],
                  ["3.", "If A is a 3×3 invertible matrix, then det(A⁻¹) equals —", null],
                  ["4.", "The principal value of cos⁻¹(–½) is —", null],
                ].map(([n, body], i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "7px 0" }}>
                    <span className="pc-serif" style={{ fontSize: 12, fontWeight: 500, minWidth: 22, textAlign: "right" }}>{n}</span>
                    <div className="pc-serif" style={{ flex: 1, fontSize: 12, lineHeight: 1.55 }}>{body}</div>
                    <span className="pc-serif" style={{ fontSize: 11, color: "var(--pc-ink-3)", paddingTop: 2 }}>[1]</span>
                  </div>
                ))}

                {/* Section B with comment */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "18px 0 10px", paddingBottom: 6, borderBottom: "1px dashed var(--pc-ink-4)" }}>
                  <span className="pc-serif" style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Section B <span style={{ color: "var(--pc-ink-4)", textTransform: "none", fontStyle: "italic", fontWeight: 400 }}>· Very Short Answer</span></span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 10, color: "var(--pc-ink-3)" }}>5 × 2 = 10</span>
                </div>

                {/* Repeated question highlighted */}
                <div style={{ display: "flex", gap: 12, padding: "7px 0", background: "linear-gradient(90deg, rgba(220,74,61,0.10), transparent 80%)", borderRadius: 4, position: "relative", outline: "1px dashed var(--pc-danger)" }}>
                  <span className="pc-serif" style={{ fontSize: 12, fontWeight: 500, minWidth: 22, textAlign: "right" }}>21.</span>
                  <div className="pc-serif" style={{ flex: 1, fontSize: 12, lineHeight: 1.55 }}>
                    Differentiate <span className="pc-math">sin(log x)</span> with respect to x.
                  </div>
                  <span className="pc-serif" style={{ fontSize: 11, color: "var(--pc-ink-3)", paddingTop: 2 }}>[2]</span>
                  <div style={{ position: "absolute", right: -32, top: 2, width: 22, height: 22, borderRadius: 5, background: "var(--pc-danger)", color: "white", display: "grid", placeItems: "center", boxShadow: "var(--pc-shadow-md)" }}>
                    <Icon name="warn" size={12} />
                  </div>
                </div>

                {[
                  ["22.", "Find the value of k for which the function f(x) = kx² is continuous at x = 0."],
                  ["23.", "Evaluate ∫ x · eˣ dx."],
                  ["24.", "Find the angle between the vectors a = 2i + 3j – k and b = i – j + k."],
                ].map(([n, body]) => (
                  <div key={n} style={{ display: "flex", gap: 12, padding: "7px 0" }}>
                    <span className="pc-serif" style={{ fontSize: 12, fontWeight: 500, minWidth: 22, textAlign: "right" }}>{n}</span>
                    <div className="pc-serif" style={{ flex: 1, fontSize: 12, lineHeight: 1.55 }}>{body}</div>
                    <span className="pc-serif" style={{ fontSize: 11, color: "var(--pc-ink-3)", paddingTop: 2 }}>[2]</span>
                  </div>
                ))}

                {/* Watermark */}
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
                  <span className="pc-serif" style={{ fontSize: 70, color: "rgba(220,74,61,0.05)", letterSpacing: "0.04em", transform: "rotate(-30deg)", fontWeight: 500 }}>UNDER REVIEW</span>
                </div>

                <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, display: "flex", justifyContent: "space-between", padding: "0 50px", fontSize: 9, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <span>Mathematics · XII · Set A</span><span>Page 1 of 3</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, width: 595, margin: "20px auto", color: "var(--pc-ink-4)" }}>
                <span style={{ flex: 1, height: 1, background: "var(--pc-line-2)" }} />
                <span style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>page break · 2 of 3</span>
                <span style={{ flex: 1, height: 1, background: "var(--pc-line-2)" }} />
              </div>
            </section>

            {/* RIGHT — Validation + AI Review */}
            <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", overflow: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--pc-line)" }}>
                {["Review","Comments","History"].map((t,i) => (
                  <button key={t} style={{
                    flex: 1, height: 40, border: 0, background: "transparent",
                    fontSize: 12, color: i === 0 ? "var(--pc-ink)" : "var(--pc-ink-4)",
                    fontWeight: i === 0 ? 500 : 400, cursor: "pointer",
                    borderBottom: "2px solid " + (i === 0 ? "var(--pc-primary)" : "transparent"),
                    fontFamily: "var(--pc-sans)",
                  }}>{t} {i === 1 && <span style={{ marginLeft: 4, fontSize: 10, color: "var(--pc-ink-4)" }} className="pc-num">3</span>}</button>
                ))}
              </div>

              <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Validation checklist */}
                <div className="pc-panel" style={{ padding: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 500, marginBottom: 8 }}>Validation checklist</div>
                  {[
                    { l: "Total marks = 80", ok: true },
                    { l: "All sections present", ok: true },
                    { l: "Internal choices configured", ok: true },
                    { l: "No repeated questions", ok: false, hint: "Q-21 used in Mid-Term 2024" },
                    { l: "Bloom distribution balanced", ok: false, hint: "HOTS at 4% — target 8%" },
                    { l: "Solve time within window", ok: true, hint: "est. 168 / 180 min" },
                  ].map(c => (
                    <div key={c.l} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "5px 0", borderTop: "1px solid var(--pc-line)" }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, background: c.ok ? "var(--pc-success-bg)" : "var(--pc-warning-bg)", color: c.ok ? "var(--pc-success-text)" : "var(--pc-warning-text)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
                        <Icon name={c.ok ? "check" : "warn"} size={10} stroke={2.4} />
                      </span>
                      <div style={{ flex: 1, lineHeight: 1.4 }}>
                        <div style={{ fontSize: 12, color: "var(--pc-ink-2)" }}>{c.l}</div>
                        {c.hint && <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{c.hint}</div>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI review */}
                <div className="pc-panel" style={{ padding: 14, background: "var(--pc-panel-gradient)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "var(--pc-brand-gradient)", color: "white", display: "grid", placeItems: "center" }}>
                      <Icon name="sparkles" size={11} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>AI Review</span>
                    <span className="pc-tag is-primary" style={{ marginLeft: "auto", height: 18, fontSize: 9.5 }}>2 findings</span>
                  </div>
                  <p className="pc-serif" style={{ fontStyle: "italic", fontSize: 11.5, color: "var(--pc-ink-3)", margin: "2px 0 10px", lineHeight: 1.45 }}>
                    Composer compared this paper against the last 4 Class XII Pre-Boards and the active blueprint.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 9 }}>
                      <span style={{ width: 18, height: 18, borderRadius: 5, background: "var(--pc-danger-bg)", color: "var(--pc-danger-text)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <Icon name="warn" size={10} />
                      </span>
                      <div style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                        <strong style={{ fontWeight: 500 }}>Q-21 appeared in 2024 Mid-Term.</strong> <span style={{ color: "var(--pc-ink-3)" }}>Replace with a fresh derivative question?</span>
                        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                          <button className="pc-btn is-sm">Suggest 3 replacements</button>
                          <button className="pc-btn is-sm is-ghost">Dismiss</button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 9 }}>
                      <span style={{ width: 18, height: 18, borderRadius: 5, background: "var(--pc-warning-bg)", color: "var(--pc-warning-text)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <Icon name="info" size={10} />
                      </span>
                      <div style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                        <strong style={{ fontWeight: 500 }}>HOTS share is 4%.</strong> <span style={{ color: "var(--pc-ink-3)" }}>Blueprint target is 8%. One Section-D HOTS would close the gap.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline comments */}
                <div>
                  <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Inline comments · 3</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Comment av="is-blue" initials="AK" name="Aarav K." when="just now" tone="request"
                      body="Q-1 is a touch easy for opening a Pre-Board paper. Consider swapping with a polynomial-roots MCQ — keeps 1 mark but raises Bloom to Apply."
                      attached={{ id: "5621", snippet: "If f(x) = x³ – 6x² + 11x – 6, …" }} />
                    <Comment av="is-blue" initials="AK" name="Aarav K." when="2 min ago" tone="request"
                      body="This was Q-14 in Mid-Term 2024 — students will remember. Please replace."
                      attached={{ id: "0421", snippet: "Differentiate sin(log x) wrt x." }} />
                    <Comment av="is-rose" initials="PN" name="Priya N." when="just now" tone="default" resolved
                      body="Acknowledged — I'll swap in a chain-rule variant from the trig section." />
                  </div>
                  <div style={{ marginTop: 12, background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 8, padding: 10, boxShadow: "var(--pc-shadow-xs)" }}>
                    <textarea placeholder="Reply or @mention…" style={{ width: "100%", border: 0, outline: "none", fontFamily: "var(--pc-sans)", fontSize: 12, color: "var(--pc-ink)", resize: "none", background: "transparent" }} rows={2} defaultValue="" />
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button className="pc-btn is-sm is-ghost"><Icon name="paperclip" size={11} /></button>
                      <button className="pc-btn is-sm is-ghost"><Icon name="flag" size={11} /></button>
                      <span style={{ flex: 1 }} />
                      <button className="pc-btn is-sm is-primary">Send</button>
                    </div>
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

window.Approval = Approval;
