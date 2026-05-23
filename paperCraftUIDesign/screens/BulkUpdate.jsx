// BulkUpdate.jsx — Bulk Update flow (5 screens)
//
// Story: an admin selects 47 questions in the Quadratic Equations chapter
// (mostly Draft, 3-mark Short-Answer) and bulk-updates them:
//   · Marks      3 → 4
//   · Status     Draft → Approved
//   · + Tag      "NCERT-2025"
//   · Move to    "Quadratic Equations (NCERT 2025)"
//
// Flow:
//   ① Select  · in Repository, with selection drawer
//   ② Scope   · pick which fields to change
//   ③ Values  · configure new values per field
//   ④ Preview · diff table + conflicts side panel
//   ⑤ Done    · success + undo + audit log

// ───────────────────────────────────────────────────────────────────────────
// Shared bits
// ───────────────────────────────────────────────────────────────────────────

const BULK_STEPS = [
  { key: "select",  label: "Select" },
  { key: "scope",   label: "Scope" },
  { key: "values",  label: "Set values" },
  { key: "preview", label: "Preview" },
  { key: "done",    label: "Complete" },
];

const BulkStepper = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, fontSize: 12 }}>
    {BULK_STEPS.map((s, i) => {
      const isCur  = s.key === current;
      const idx    = BULK_STEPS.findIndex(x => x.key === current);
      const isDone = i < idx;
      return (
        <React.Fragment key={s.key}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 11px 5px 7px",
            borderRadius: 999,
            background: isCur ? "var(--pc-surface)" : "transparent",
            border: isCur ? "1px solid var(--pc-line)" : "1px solid transparent",
            boxShadow: isCur ? "var(--pc-shadow-xs)" : "none",
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 999, fontSize: 10.5,
              display: "grid", placeItems: "center", fontWeight: 500,
              background: isCur ? "var(--pc-primary)" : isDone ? "var(--pc-ink)" : "var(--pc-surface-3)",
              color: (isCur || isDone) ? "white" : "var(--pc-ink-4)",
              border: isDone ? "none" : isCur ? "none" : "1px solid var(--pc-line)",
            }} className="pc-num">
              {isDone ? <Icon name="check" size={10} style={{ strokeWidth: 3 }} /> : i + 1}
            </span>
            <span style={{
              color: isCur ? "var(--pc-ink)" : isDone ? "var(--pc-ink-3)" : "var(--pc-ink-4)",
              fontWeight: isCur ? 500 : 400,
            }}>{s.label}</span>
          </div>
          {i < BULK_STEPS.length - 1 && (
            <span style={{
              width: 18, height: 1, margin: "0 2px",
              background: i < idx ? "var(--pc-ink-4)" : "var(--pc-line-2)",
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// Minimal question rows for the selection / preview tables
const BULK_QUESTIONS = [
  { id: "Q-2841", chapter: "Quadratic Equations", topic: "Nature of Roots",     marks: 3, diff: 3, type: "SA", status: "Draft",    lang: "EN+HI", body: "If the roots of the equation (b–c)x² + (c–a)x + (a–b) = 0 are equal, prove that 2b = a + c.", _sel: true,  _conflict: null },
  { id: "Q-2843", chapter: "Quadratic Equations", topic: "Word Problems",       marks: 3, diff: 3, type: "SA", status: "Draft",    lang: "EN+HI", body: "A train, travelling at a uniform speed for 360 km, would have taken 48 minutes less had its speed been 5 km/h more. Find its original speed.", _sel: true, _conflict: null },
  { id: "Q-2847", chapter: "Quadratic Equations", topic: "Discriminant",        marks: 3, diff: 2, type: "SA", status: "Draft",    lang: "EN",    body: "Find the discriminant of 2x² – 4x + 3 = 0 and hence the nature of its roots.", _sel: true, _conflict: null },
  { id: "Q-2849", chapter: "Quadratic Equations", topic: "Factorisation",       marks: 3, diff: 2, type: "SA", status: "Approved", lang: "EN+HI", body: "Solve by factorisation: 6x² – x – 2 = 0.", _sel: true, _conflict: "locked" },
  { id: "Q-2851", chapter: "Quadratic Equations", topic: "Completing Square",   marks: 3, diff: 3, type: "SA", status: "Draft",    lang: "EN",    body: "Solve by completing the square: 2x² + x – 4 = 0.", _sel: true, _conflict: null },
  { id: "Q-2853", chapter: "Quadratic Equations", topic: "Sum & Product",       marks: 3, diff: 3, type: "SA", status: "Draft",    lang: "EN+HI", body: "If α and β are roots of x² – 5x + k = 0 and α – β = 1, find k.", _sel: true, _conflict: null },
  { id: "Q-2855", chapter: "Quadratic Equations", topic: "Word Problems",       marks: 3, diff: 4, type: "SA", status: "Draft",    lang: "EN",    body: "The product of two consecutive positive integers is 306. Form the equation and solve.", _sel: true, _conflict: null },
  { id: "Q-2857", chapter: "Quadratic Equations", topic: "Nature of Roots",     marks: 3, diff: 2, type: "SA", status: "Draft",    lang: "EN+HI", body: "Find k so that kx² – 2kx + 6 = 0 has equal roots.", _sel: true, _conflict: null },
  { id: "Q-2859", chapter: "Quadratic Equations", topic: "Word Problems",       marks: 3, diff: 4, type: "SA", status: "Draft",    lang: "EN+HI", body: "A motor boat whose speed in still water is 18 km/h, takes 1 hour more to go 24 km upstream than to return. Find the speed of the stream.", _sel: true, _conflict: "duplicate" },
  { id: "Q-2861", chapter: "Quadratic Equations", topic: "Discriminant",        marks: 3, diff: 3, type: "SA", status: "Draft",    lang: "EN",    body: "For what value of m will the equation x² – mx + (m – 1) = 0 have real and equal roots?", _sel: true, _conflict: null },
];

// ═══════════════════════════════════════════════════════════════════════════
// ① SELECT — Repository with selection mode active
// ═══════════════════════════════════════════════════════════════════════════

const BulkSelectRepo = () => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="repo" items={ADMIN_NAV}
        footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar
          crumbs={["Academic", "Question Repository", "Mathematics · Class X"]}
          actions={<>
            <button className="pc-btn"><Icon name="upload" size={14} />Bulk Upload</button>
            <button className="pc-btn"><Icon name="check" size={14} />Selection Mode</button>
          </>}
        />

        {/* Selection-mode banner */}
        <div style={{ background: "var(--pc-primary-50)", borderBottom: "1px solid #C9D4FF", padding: "11px 28px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--pc-primary)", color: "white", display: "grid", placeItems: "center" }}>
            <Icon name="check" size={13} style={{ strokeWidth: 3 }} />
          </div>
          <div style={{ fontSize: 12.5, color: "var(--pc-primary-ink)" }}>
            <strong style={{ fontWeight: 500 }}>Selection Mode</strong>
            <span style={{ marginLeft: 8, opacity: 0.85 }}>Click rows to select. Hold <kbd style={{ fontFamily: "var(--pc-mono)", fontSize: 10.5, padding: "1px 5px", background: "white", border: "1px solid #C9D4FF", borderRadius: 4 }}>Shift</kbd> to extend.</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button className="pc-btn is-sm">Select all in view (47)</button>
            <button className="pc-btn is-sm is-ghost">Cancel</button>
          </div>
        </div>

        {/* Page header */}
        <div style={{ padding: "18px 28px 12px", background: "var(--pc-bg)", borderBottom: "1px solid var(--pc-line)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Selection · Quadratic Equations</div>
              <h1 className="pc-serif" style={{ fontSize: 24, fontWeight: 500, margin: 0, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
                47 questions selected <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>of 248 in view</span>
              </h1>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 11.5, color: "var(--pc-ink-4)" }}>
              <span>Class X · Mathematics · Quadratic Equations</span>
              <span style={{ width: 1, height: 14, background: "var(--pc-line)" }} />
              <span>Filtered: Draft + Approved · 3-mark</span>
            </div>
          </div>
        </div>

        {/* Two-column: filters + table */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", flex: 1, minHeight: 0 }}>
          {/* Quick filter rail */}
          <aside style={{ borderRight: "1px solid var(--pc-line)", padding: "16px 16px", background: "var(--pc-surface-2)", overflow: "auto" }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Saved selections</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                ["All draft questions", 124, true],
                ["Quad. Eq. · 3-mark", 47, false],
                ["HOTS uncategorised", 18, false],
                ["Pre-Board 2024 reused", 32, false],
              ].map(([label, count, active], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 10px", borderRadius: 7, background: active ? "var(--pc-surface)" : "transparent", border: active ? "1px solid var(--pc-line)" : "1px solid transparent", boxShadow: active ? "var(--pc-shadow-xs)" : "none", cursor: "pointer" }}>
                  <span style={{ fontSize: 12.5, color: active ? "var(--pc-ink)" : "var(--pc-ink-2)", fontWeight: active ? 500 : 400 }}>{label}</span>
                  <span className="pc-num" style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)" }}>{count}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, margin: "20px 0 10px" }}>Selection summary</div>
            <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 13px", boxShadow: "var(--pc-shadow-xs)", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["By status", [["Draft", 45, "var(--pc-warning)"], ["Approved", 2, "var(--pc-success)"]]],
                ["By difficulty", [["Easy", 4, "var(--pc-success)"], ["Medium", 28, "var(--pc-primary)"], ["Hard", 15, "var(--pc-danger)"]]],
                ["By type", [["SA", 47, "var(--pc-ink-2)"]]],
              ].map(([label, rows]) => (
                <div key={label}>
                  <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                  {rows.map(([k, n, c]) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, padding: "3px 0", fontSize: 11.5, color: "var(--pc-ink-2)" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: c }} />
                      <span>{k}</span>
                      <span className="pc-num" style={{ marginLeft: "auto", color: "var(--pc-ink-3)" }}>{n}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* Compact selection table */}
          <section className="pc-scroll" style={{ overflow: "auto", padding: "14px 22px 80px", background: "var(--pc-bg)" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12.5 }}>
              <thead>
                <tr style={{ position: "sticky", top: 0, background: "var(--pc-bg)", zIndex: 1 }}>
                  {["", "ID", "Question", "Topic", "Type", "Marks", "Diff.", "Status", "Lang"].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "9px 10px", borderBottom: "1px solid var(--pc-line-2)", fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BULK_QUESTIONS.map((q, i) => (
                  <tr key={q.id} style={{
                    background: q._sel ? "rgba(53,92,255,0.05)" : "var(--pc-surface)",
                    borderLeft: q._sel ? "2px solid var(--pc-primary)" : "2px solid transparent",
                  }}>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid var(--pc-line)", width: 32 }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, border: q._sel ? "none" : "1px solid var(--pc-line-2)", background: q._sel ? "var(--pc-primary)" : "var(--pc-surface)", display: "grid", placeItems: "center" }}>
                        {q._sel && <Icon name="check" size={10} style={{ color: "white", strokeWidth: 3 }} />}
                      </span>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid var(--pc-line)" }}>
                      <span className="pc-mono" style={{ fontSize: 11, color: "var(--pc-ink-3)" }}>{q.id}</span>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid var(--pc-line)", maxWidth: 420 }}>
                      <span className="pc-serif" style={{ fontSize: 13, color: "var(--pc-ink)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{q.body}</span>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid var(--pc-line)", color: "var(--pc-ink-3)", fontSize: 11.5 }}>{q.topic}</td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid var(--pc-line)" }}><span className="pc-tag is-outline">{q.type}</span></td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid var(--pc-line)", color: "var(--pc-ink-2)" }} className="pc-num">{q.marks}m</td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid var(--pc-line)" }}><Difficulty level={q.diff} /></td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid var(--pc-line)" }}>
                      <span className={"pc-tag " + (q.status === "Draft" ? "is-warning" : "is-success")}>{q.status}</span>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid var(--pc-line)", color: "var(--pc-ink-4)", fontSize: 11.5 }}>{q.lang}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: "center", marginTop: 16, fontSize: 11.5, color: "var(--pc-ink-4)" }}>
              Showing 10 of 47 selected · <a href="#" style={{ color: "var(--pc-primary)", textDecoration: "none" }}>view all</a>
            </div>
          </section>
        </div>

        {/* Floating selection drawer */}
        <div className="pc-float" style={{
          position: "absolute", left: "50%", bottom: 22, transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 14, padding: "10px 12px 10px 18px",
          zIndex: 10, minWidth: 620,
        }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--pc-primary)", color: "white", display: "grid", placeItems: "center", fontWeight: 500 }} className="pc-serif">47</span>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--pc-ink)" }}>47 questions selected</div>
            <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Quadratic Equations · 45 Draft · 2 Approved</div>
          </div>
          <div style={{ width: 1, height: 22, background: "var(--pc-line)", margin: "0 4px" }} />
          <button className="pc-btn is-sm is-ghost"><Icon name="eye" size={12} />Review</button>
          <button className="pc-btn is-sm is-ghost"><Icon name="archive" size={12} />Archive</button>
          <button className="pc-btn is-sm is-ghost"><Icon name="download" size={12} />Export</button>
          <button className="pc-btn is-primary"><Icon name="edit" size={13} />Bulk Edit →</button>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// Shared wizard chrome (Steps 2-4 sit inside this)
// ═══════════════════════════════════════════════════════════════════════════

const WizardChrome = ({ step, footer, children }) => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="repo" items={ADMIN_NAV}
        footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar
          crumbs={["Academic", "Question Repository", "Bulk Edit"]}
          actions={<>
            <button className="pc-btn is-sm is-ghost"><Icon name="arrowLeft" size={13} />Cancel</button>
          </>}
        />

        {/* Stepper bar */}
        <div style={{ padding: "14px 28px", background: "var(--pc-bg)", borderBottom: "1px solid var(--pc-line)", display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #2A47CC, #6789FF)", color: "white", display: "grid", placeItems: "center", boxShadow: "0 4px 10px -2px rgba(53,92,255,0.45)" }}>
              <Icon name="sliders" size={14} />
            </span>
            <div style={{ lineHeight: 1.2 }}>
              <div className="pc-serif" style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.018em" }}>Bulk Edit · 47 questions</div>
              <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Quadratic Equations · started 2 min ago by Aarav Kapoor</div>
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}><BulkStepper current={step} /></div>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "var(--pc-bg)" }}>
          {children}
        </div>

        {footer}
      </div>
    </div>
  </div>
);

const WizardFooter = ({ left, right }) => (
  <div style={{
    height: 64, borderTop: "1px solid var(--pc-line)", background: "var(--pc-surface)",
    padding: "0 28px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
    boxShadow: "0 -4px 12px -8px rgba(0,0,0,0.06)",
  }}>
    {left}
    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>{right}</div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// ② SCOPE — Pick which fields to update
// ═══════════════════════════════════════════════════════════════════════════

const FieldCard = ({ icon, name, current, selected, onClick, disabled, danger }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: selected ? "var(--pc-surface)" : "var(--pc-surface)",
    border: "1px solid " + (selected ? "var(--pc-primary)" : "var(--pc-line)"),
    borderRadius: 12, padding: "14px 16px",
    boxShadow: selected ? "0 0 0 3px rgba(53,92,255,0.12), var(--pc-shadow-xs)" : "var(--pc-shadow-xs)",
    cursor: disabled ? "not-allowed" : "pointer",
    textAlign: "left", fontFamily: "var(--pc-sans)",
    opacity: disabled ? 0.5 : 1,
    display: "flex", alignItems: "flex-start", gap: 12,
    position: "relative",
  }}>
    <span style={{ width: 32, height: 32, borderRadius: 8, background: selected ? "var(--pc-primary-50)" : "var(--pc-surface-3)", display: "grid", placeItems: "center", color: selected ? "var(--pc-primary)" : "var(--pc-ink-3)", flexShrink: 0 }}>
      <Icon name={icon} size={15} />
    </span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--pc-ink)" }}>{name}</span>
        {danger && <span className="pc-tag is-danger">destructive</span>}
        {disabled && <span className="pc-tag">locked</span>}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginTop: 3, lineHeight: 1.4 }}>{current}</div>
    </div>
    <span style={{ width: 16, height: 16, borderRadius: 4, border: selected ? "none" : "1px solid var(--pc-line-2)", background: selected ? "var(--pc-primary)" : "var(--pc-surface)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
      {selected && <Icon name="check" size={10} style={{ color: "white", strokeWidth: 3 }} />}
    </span>
  </button>
);

const BulkScope = () => (
  <WizardChrome step="scope"
    footer={<WizardFooter
      left={<span style={{ fontSize: 12, color: "var(--pc-ink-3)" }}>
        <strong style={{ color: "var(--pc-ink)", fontWeight: 500 }}>4 fields</strong> will be modified · <a href="#" style={{ color: "var(--pc-primary)", textDecoration: "none" }}>review selection</a>
      </span>}
      right={<>
        <button className="pc-btn"><Icon name="arrowLeft" size={13} />Back</button>
        <button className="pc-btn is-primary">Next · Set values<Icon name="arrowRight" size={13} /></button>
      </>}
    />}
  >
    <div className="pc-scroll" style={{ overflow: "auto", padding: "28px 36px 32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 className="pc-serif" style={{ fontSize: 28, fontWeight: 500, margin: 0, letterSpacing: "-0.022em" }}>
          Which fields would you like to change?
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--pc-ink-3)", margin: "6px 0 0", lineHeight: 1.55 }}>
          Pick one or more. You'll set the new values on the next step. Locked fields belong to questions inside approved papers and can't be edited in bulk.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FieldCard icon="target" name="Marks" current="Currently · 47 × 3-mark" selected={true} />
        <FieldCard icon="check" name="Status" current="Currently · 45 Draft + 2 Approved" selected={true} />
        <FieldCard icon="flag" name="Tags" current="Add, remove, or replace tags across the selection" selected={true} />
        <FieldCard icon="folder" name="Chapter" current="Currently · Quadratic Equations" selected={true} />
        <FieldCard icon="bars" name="Difficulty" current="Currently · 4 Easy · 28 Med · 15 Hard" selected={false} />
        <FieldCard icon="users" name="Author" current="Currently · 4 authors across selection" selected={false} />
        <FieldCard icon="layers" name="Bloom's level" current="Currently · 21 Apply · 18 Understand · 8 Analyze" selected={false} />
        <FieldCard icon="image" name="Diagrams & figures" current="Replace, remove, or batch-regenerate visuals" selected={false} />
        <FieldCard icon="lock" name="Lock for editing" current="Prevent further changes until unlocked" selected={false} danger={true} />
        <FieldCard icon="archive" name="Archive" current="Move to archive — won't appear in new papers" selected={false} danger={true} />
      </div>

      {/* Conflicts banner */}
      <div style={{ marginTop: 22, background: "var(--pc-warning-bg)", border: "1px solid #F0D798", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ width: 24, height: 24, borderRadius: 6, background: "var(--pc-warning)", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon name="warn" size={13} />
        </span>
        <div style={{ flex: 1, fontSize: 12.5, color: "#7A4F0E", lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 500 }}>2 questions are part of a locked, approved paper</strong> (Pre-Board · Set A). Their Marks and Status won't be modified — you can choose to skip them or unlock the paper first.
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button className="pc-btn is-sm">Skip locked questions</button>
            <button className="pc-btn is-sm is-ghost">View affected papers</button>
          </div>
        </div>
      </div>
    </div>
  </WizardChrome>
);

// ═══════════════════════════════════════════════════════════════════════════
// ③ VALUES — Configure the new value for each chosen field
// ═══════════════════════════════════════════════════════════════════════════

const OpToggle = ({ options, value }) => (
  <div style={{ display: "inline-flex", background: "var(--pc-surface-3)", borderRadius: 7, padding: 2, gap: 0 }}>
    {options.map(o => (
      <span key={o} style={{
        padding: "4px 11px", fontSize: 11.5, fontWeight: 500,
        borderRadius: 5,
        background: o === value ? "var(--pc-surface)" : "transparent",
        color: o === value ? "var(--pc-ink)" : "var(--pc-ink-4)",
        boxShadow: o === value ? "var(--pc-shadow-xs)" : "none",
        cursor: "pointer",
      }}>{o}</span>
    ))}
  </div>
);

const ValueRow = ({ icon, field, op, opOptions, control, helper }) => (
  <div style={{
    background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12,
    boxShadow: "var(--pc-shadow-xs)", padding: "16px 20px",
    display: "grid", gridTemplateColumns: "180px 1fr", gap: 24, alignItems: "start",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 28, height: 28, borderRadius: 7, background: "var(--pc-primary-50)", color: "var(--pc-primary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon name={icon} size={14} />
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--pc-ink)" }}>{field}</span>
    </div>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>Operation</span>
        <OpToggle options={opOptions} value={op} />
      </div>
      {control}
      {helper && <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginTop: 8, lineHeight: 1.5 }}>{helper}</div>}
    </div>
  </div>
);

const BulkValues = () => (
  <WizardChrome step="values"
    footer={<WizardFooter
      left={<span style={{ fontSize: 12, color: "var(--pc-ink-3)" }}>
        4 changes configured · <strong style={{ color: "var(--pc-ink)", fontWeight: 500 }}>180 cells</strong> will be written
      </span>}
      right={<>
        <button className="pc-btn"><Icon name="arrowLeft" size={13} />Back</button>
        <button className="pc-btn is-primary">Preview changes<Icon name="arrowRight" size={13} /></button>
      </>}
    />}
  >
    <div className="pc-scroll" style={{ overflow: "auto", padding: "26px 36px 32px", maxWidth: 1080, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 18 }}>
        <h2 className="pc-serif" style={{ fontSize: 24, fontWeight: 500, margin: 0, letterSpacing: "-0.022em" }}>Set the new values</h2>
        <p style={{ fontSize: 12.5, color: "var(--pc-ink-3)", margin: "4px 0 0" }}>Each row shows the field, the operation, and the new value. Operations are non-destructive until you confirm in the next step.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Marks */}
        <ValueRow icon="target" field="Marks"
          op="Replace with" opOptions={["Replace with", "Increase by", "Decrease by"]}
          control={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "inline-flex", alignItems: "center", background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 8, height: 36, padding: "0 4px" }}>
                <button style={{ width: 28, height: 28, borderRadius: 6, border: 0, background: "transparent", color: "var(--pc-ink-3)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="minus" size={14} /></button>
                <span className="pc-serif pc-num" style={{ width: 44, textAlign: "center", fontSize: 17, color: "var(--pc-ink)", fontWeight: 500 }}>4</span>
                <button style={{ width: 28, height: 28, borderRadius: 6, border: 0, background: "transparent", color: "var(--pc-ink-3)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="plus" size={14} /></button>
              </div>
              <span style={{ fontSize: 12, color: "var(--pc-ink-4)" }}>marks per question</span>
              <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--pc-ink-3)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="pc-num">3</span>
                <Icon name="arrowRight" size={11} />
                <span className="pc-num" style={{ color: "var(--pc-primary)", fontWeight: 500 }}>4</span>
                <span style={{ color: "var(--pc-ink-4)" }}>· for all 47</span>
              </span>
            </div>
          }
          helper="Total marks across the selection: 141 → 188. The 2 locked questions will be skipped."
        />

        {/* Status */}
        <ValueRow icon="check" field="Status"
          op="Set to" opOptions={["Set to", "Promote", "Revert"]}
          control={
            <div style={{ display: "flex", gap: 6 }}>
              {[
                ["Draft", "is-warning"],
                ["In Review", ""],
                ["Approved", "is-success"],
                ["Locked", ""],
              ].map(([label, tone], i) => (
                <span key={label} className={"pc-tag " + tone} style={{
                  height: 30, padding: "0 12px", fontSize: 12.5,
                  border: label === "Approved" ? "1.5px solid var(--pc-success)" : "1.5px solid transparent",
                  boxShadow: label === "Approved" ? "0 0 0 3px rgba(20,184,122,0.12)" : "none",
                  cursor: "pointer",
                }}>{label}</span>
              ))}
            </div>
          }
          helper="45 Draft questions will move to Approved. 2 already Approved stay as-is."
        />

        {/* Tags */}
        <ValueRow icon="flag" field="Tags"
          op="Add" opOptions={["Add", "Remove", "Replace all"]}
          control={
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 10px", background: "var(--pc-surface-2)", border: "1px dashed var(--pc-line-2)", borderRadius: 8, minHeight: 40, alignItems: "center" }}>
                <span className="pc-tag is-primary" style={{ height: 22 }}>
                  NCERT-2025
                  <Icon name="plus" size={10} style={{ transform: "rotate(45deg)", marginLeft: 3, opacity: 0.6 }} />
                </span>
                <span className="pc-tag is-primary" style={{ height: 22 }}>
                  Term-II
                  <Icon name="plus" size={10} style={{ transform: "rotate(45deg)", marginLeft: 3, opacity: 0.6 }} />
                </span>
                <input placeholder="Add a tag…" style={{ flex: 1, minWidth: 100, height: 22, border: 0, background: "transparent", fontSize: 12.5, color: "var(--pc-ink-2)", fontFamily: "var(--pc-sans)", outline: "none" }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--pc-ink-4)" }}>
                Suggestions ·
                {["Quadratic", "HOTS", "Board-Pattern", "Practice"].map(t => (
                  <span key={t} className="pc-tag is-outline" style={{ marginLeft: 6, height: 20, fontSize: 10.5 }}>+ {t}</span>
                ))}
              </div>
            </div>
          }
        />

        {/* Chapter */}
        <ValueRow icon="folder" field="Chapter"
          op="Move to" opOptions={["Move to", "Duplicate to"]}
          control={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", height: 36, border: "1px solid var(--pc-line)", borderRadius: 8, background: "var(--pc-surface-2)" }}>
                <Icon name="folder" size={14} style={{ color: "var(--pc-ink-4)" }} />
                <span className="pc-serif" style={{ fontSize: 13.5, color: "var(--pc-ink)" }}>Quadratic Equations <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>(NCERT 2025)</span></span>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--pc-ink-4)" }}>
                  <span className="pc-tag is-success" style={{ height: 18, fontSize: 10 }}>new</span>
                  62 existing questions
                </span>
                <Icon name="chevDown" size={13} style={{ color: "var(--pc-ink-4)" }} />
              </div>
              <button className="pc-btn is-sm is-ghost"><Icon name="plus" size={12} />Create new chapter</button>
            </div>
          }
          helper="The old chapter 'Quadratic Equations' will be left empty — you'll be prompted to archive it after the move completes."
        />
      </div>

      {/* Add a field */}
      <button style={{
        marginTop: 14, width: "100%", padding: "12px 16px",
        background: "transparent", border: "1.5px dashed var(--pc-line-2)", borderRadius: 12,
        color: "var(--pc-ink-3)", fontSize: 12.5, fontWeight: 500, fontFamily: "var(--pc-sans)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <Icon name="plus" size={13} /> Add another field to update
      </button>
    </div>
  </WizardChrome>
);

// ═══════════════════════════════════════════════════════════════════════════
// ④ PREVIEW — Diff table + conflict side panel
// ═══════════════════════════════════════════════════════════════════════════

const DiffCell = ({ before, after, skipped }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
    <span style={{ color: "var(--pc-ink-4)", textDecoration: skipped ? "none" : "line-through" }} className="pc-num">{before}</span>
    <Icon name="arrowRight" size={10} style={{ color: "var(--pc-ink-5)" }} />
    <span className="pc-num" style={{
      color: skipped ? "var(--pc-ink-4)" : "var(--pc-primary)",
      fontWeight: 500,
      opacity: skipped ? 0.5 : 1,
    }}>{skipped ? "—" : after}</span>
  </span>
);

const BulkPreview = () => (
  <WizardChrome step="preview"
    footer={<WizardFooter
      left={
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12 }}>
          <span style={{ color: "var(--pc-ink-3)" }}>
            <strong style={{ color: "var(--pc-success)", fontWeight: 500 }}>45 will update</strong> · <strong style={{ color: "var(--pc-warning)", fontWeight: 500 }}>2 skipped</strong>
          </span>
          <span style={{ width: 1, height: 16, background: "var(--pc-line)" }} />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--pc-ink-2)", cursor: "pointer" }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--pc-primary)", display: "grid", placeItems: "center" }}>
              <Icon name="check" size={9} style={{ color: "white", strokeWidth: 3 }} />
            </span>
            Notify authors after update
          </label>
        </div>
      }
      right={<>
        <button className="pc-btn"><Icon name="arrowLeft" size={13} />Back</button>
        <button className="pc-btn is-primary"><Icon name="check" size={13} />Apply changes to 45 questions</button>
      </>}
    />}
  >
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", flex: 1, minHeight: 0 }}>
      {/* Diff table */}
      <section className="pc-scroll" style={{ overflow: "auto", padding: "22px 26px 28px" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Step 4 · Preview &amp; conflicts</div>
          <h2 className="pc-serif" style={{ fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: "-0.022em" }}>Here's what will change</h2>
        </div>

        {/* Summary chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {[
            ["Marks", "3 → 4", "is-primary"],
            ["Status", "Draft → Approved", "is-success"],
            ["+ Tag", "NCERT-2025, Term-II", "is-primary"],
            ["Chapter", "→ Quadratic Eq. (NCERT 2025)", "is-primary"],
          ].map(([k, v, tone]) => (
            <span key={k} className={"pc-tag " + tone} style={{ height: 24, padding: "0 10px", fontSize: 11.5 }}>
              <span style={{ opacity: 0.7, marginRight: 5 }}>{k}</span>{v}
            </span>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12, overflow: "hidden", boxShadow: "var(--pc-shadow-xs)" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--pc-surface-2)" }}>
                {["ID", "Question", "Marks", "Status", "Tags", "Chapter", ""].map((h, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--pc-line)", fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BULK_QUESTIONS.map((q) => {
                const isSkip = q._conflict === "locked";
                return (
                  <tr key={q.id} style={{ background: isSkip ? "rgba(224,138,31,0.04)" : "transparent" }}>
                    <td style={{ padding: "12px 12px", borderBottom: "1px solid var(--pc-line)", verticalAlign: "top" }}>
                      <span className="pc-mono" style={{ fontSize: 11, color: "var(--pc-ink-3)" }}>{q.id}</span>
                    </td>
                    <td style={{ padding: "12px 12px", borderBottom: "1px solid var(--pc-line)", maxWidth: 320, verticalAlign: "top" }}>
                      <div className="pc-serif" style={{ fontSize: 12.5, color: "var(--pc-ink)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{q.body}</div>
                      {q._conflict && (
                        <div style={{ marginTop: 6, fontSize: 10.5, color: q._conflict === "locked" ? "var(--pc-warning)" : "var(--pc-danger)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Icon name={q._conflict === "locked" ? "lock" : "warn"} size={10} />
                          {q._conflict === "locked" ? "Locked in Pre-Board · Set A" : "Near-duplicate of Q-3120"}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 12px", borderBottom: "1px solid var(--pc-line)", verticalAlign: "top" }}>
                      <DiffCell before="3m" after="4m" skipped={isSkip} />
                    </td>
                    <td style={{ padding: "12px 12px", borderBottom: "1px solid var(--pc-line)", verticalAlign: "top" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span className={"pc-tag " + (q.status === "Draft" ? "is-warning" : "is-success")} style={{ height: 20, fontSize: 10.5, opacity: isSkip ? 0.5 : (q.status === "Approved" ? 1 : 0.5), textDecoration: q.status === "Draft" ? "line-through" : "none" }}>{q.status}</span>
                        {!isSkip && q.status === "Draft" && <>
                          <Icon name="arrowRight" size={10} style={{ color: "var(--pc-ink-5)" }} />
                          <span className="pc-tag is-success" style={{ height: 20, fontSize: 10.5 }}>Approved</span>
                        </>}
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px", borderBottom: "1px solid var(--pc-line)", verticalAlign: "top" }}>
                      <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 3 }}>
                        <span className="pc-tag is-primary" style={{ height: 18, fontSize: 10, opacity: isSkip ? 0.4 : 1 }}>+ NCERT-2025</span>
                        <span className="pc-tag is-primary" style={{ height: 18, fontSize: 10, opacity: isSkip ? 0.4 : 1 }}>+ Term-II</span>
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px", borderBottom: "1px solid var(--pc-line)", verticalAlign: "top", fontSize: 11.5, color: "var(--pc-ink-3)" }}>
                      {isSkip ? <span style={{ color: "var(--pc-ink-4)" }}>—</span> : <span style={{ color: "var(--pc-primary)", fontWeight: 500 }}>QE (NCERT 2025)</span>}
                    </td>
                    <td style={{ padding: "12px 12px", borderBottom: "1px solid var(--pc-line)", verticalAlign: "top" }}>
                      {isSkip
                        ? <span className="pc-tag is-warning" style={{ height: 20, fontSize: 10.5 }}>skip</span>
                        : <span className="pc-tag is-success" style={{ height: 20, fontSize: 10.5 }}>ready</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 11.5, color: "var(--pc-ink-4)" }}>
          Showing 10 of 47 · <a href="#" style={{ color: "var(--pc-primary)", textDecoration: "none" }}>load 37 more</a>
        </div>
      </section>

      {/* Right panel — conflicts + audit */}
      <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "22px 22px", overflow: "auto" }}>
        <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Conflicts &amp; flags</div>

        {/* Locked */}
        <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--pc-warning-bg)", color: "var(--pc-warning)", display: "grid", placeItems: "center" }}>
              <Icon name="lock" size={12} />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>2 questions are locked</span>
            <span className="pc-tag is-warning" style={{ marginLeft: "auto", height: 18, fontSize: 10 }}>skip</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", lineHeight: 1.5 }}>
            <strong style={{ fontWeight: 500, color: "var(--pc-ink-2)" }}>Q-2849</strong> is used in Pre-Board · Set A (approved). Marks and Status will be skipped; Tags and Chapter still apply.
          </div>
          <button className="pc-btn is-sm" style={{ marginTop: 9 }}><Icon name="eye" size={11} />View affected papers</button>
        </div>

        {/* Duplicate */}
        <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--pc-info-bg)", color: "var(--pc-info)", display: "grid", placeItems: "center" }}>
              <Icon name="info" size={12} />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>1 near-duplicate detected</span>
            <span className="pc-tag is-primary" style={{ marginLeft: "auto", height: 18, fontSize: 10 }}>review</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", lineHeight: 1.5 }}>
            <strong style={{ fontWeight: 500, color: "var(--pc-ink-2)" }}>Q-2859</strong> is ~88% similar to <strong style={{ fontWeight: 500, color: "var(--pc-ink-2)" }}>Q-3120</strong>. Updating both will leave two near-identical Approved questions in the same chapter.
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
            <button className="pc-btn is-sm">Compare</button>
            <button className="pc-btn is-sm is-ghost">Skip</button>
          </div>
        </div>

        {/* Audit */}
        <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>What gets recorded</div>
        <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)", fontSize: 11.5, color: "var(--pc-ink-3)", lineHeight: 1.55 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Icon name="history" size={12} style={{ color: "var(--pc-ink-4)" }} />
            <span style={{ fontWeight: 500, color: "var(--pc-ink-2)" }}>Audit log entry</span>
          </div>
          <div>Aarav Kapoor · bulk-edit · 45 questions · 4 fields</div>
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--pc-ink-4)" }}>Reversible for 10 minutes after apply. After that, restore from version history.</div>
        </div>

        <div style={{ marginTop: 14, padding: 12, background: "var(--pc-surface-3)", borderRadius: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Icon name="info" size={14} style={{ color: "var(--pc-ink-4)", flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", lineHeight: 1.5 }}>
            Estimated time · ~6 seconds. Affected blueprints will be re-validated automatically once the update completes.
          </div>
        </div>
      </aside>
    </div>
  </WizardChrome>
);

// ═══════════════════════════════════════════════════════════════════════════
// ⑤ COMPLETE — Success state with undo + audit
// ═══════════════════════════════════════════════════════════════════════════

const BulkComplete = () => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="repo" items={ADMIN_NAV}
        footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar
          crumbs={["Academic", "Question Repository", "Bulk Edit", "Complete"]}
          actions={null}
        />

        <div className="pc-scroll" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "40px 36px", background: "var(--pc-bg)" }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
            {/* Hero */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "linear-gradient(160deg, #1ED68A, #14B87A 60%, #0E9560)",
                color: "white", display: "grid", placeItems: "center", flexShrink: 0,
                boxShadow: "0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 18px -4px rgba(20,184,122,0.55)",
              }}>
                <Icon name="check" size={28} stroke={2.2} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Step 5 of 5 · Complete</div>
                <h1 className="pc-serif" style={{ fontSize: 32, fontWeight: 500, margin: 0, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
                  45 questions updated <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>across 4 fields</span>
                </h1>
                <div style={{ fontSize: 13, color: "var(--pc-ink-3)", marginTop: 6 }}>
                  Took 5.8 seconds · 2 questions skipped (locked) · Blueprint re-validation complete.
                </div>
              </div>
            </div>

            {/* Undo + actions row */}
            <div style={{
              background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 14,
              boxShadow: "var(--pc-shadow-sm)", padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 18, marginBottom: 18,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--pc-surface-3)", color: "var(--pc-ink-3)", display: "grid", placeItems: "center" }}>
                    <Icon name="refresh" size={12} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--pc-ink)" }}>Undo window open</span>
                  <span className="pc-tag" style={{ marginLeft: 4 }}>
                    <span className="pc-num">9:42</span> remaining
                  </span>
                </div>
                <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: "var(--pc-surface-3)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "97%", background: "linear-gradient(90deg, #5A7BFF, var(--pc-primary))", borderRadius: 999 }} />
                </div>
              </div>
              <button className="pc-btn"><Icon name="refresh" size={13} />Undo all changes</button>
            </div>

            {/* Two-column summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
              {/* Changes summary */}
              <div className="pc-panel pc-panel-pad">
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 12 }}>What changed</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    ["target", "Marks", "3 → 4", "45 of 47", "var(--pc-primary)"],
                    ["check", "Status", "Draft → Approved", "45 of 47", "var(--pc-success)"],
                    ["flag", "Tags added", "+ NCERT-2025, + Term-II", "47 of 47", "var(--pc-primary)"],
                    ["folder", "Chapter moved", "→ Quadratic Eq. (NCERT 2025)", "45 of 47", "var(--pc-primary)"],
                  ].map(([icon, name, change, count, color]) => (
                    <div key={name} style={{ display: "grid", gridTemplateColumns: "32px 1fr auto", gap: 12, alignItems: "center", padding: "6px 0" }}>
                      <span style={{ width: 28, height: 28, borderRadius: 7, background: "var(--pc-surface-3)", color, display: "grid", placeItems: "center" }}>
                        <Icon name={icon} size={13} />
                      </span>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>{name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)" }}>{change}</div>
                      </div>
                      <span className="pc-num" style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>{count}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--pc-line)", display: "flex", gap: 8 }}>
                  <button className="pc-btn is-primary"><Icon name="eye" size={13} />View updated questions</button>
                  <button className="pc-btn"><Icon name="download" size={13} />Export changelog (CSV)</button>
                </div>
              </div>

              {/* Skipped + notifications */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="pc-panel pc-panel-pad">
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--pc-warning-bg)", color: "var(--pc-warning)", display: "grid", placeItems: "center" }}>
                      <Icon name="lock" size={12} />
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>2 skipped · locked</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[["Q-2849", "Solve by factorisation: 6x² – x – 2 = 0."], ["Q-2868", "Solve: 3x² – 7x + 2 = 0 by quadratic formula."]].map(([id, body]) => (
                      <div key={id} style={{ background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 8, padding: "8px 10px" }}>
                        <span className="pc-mono" style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{id}</span>
                        <div className="pc-serif" style={{ fontSize: 12, color: "var(--pc-ink-2)", lineHeight: 1.4, marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{body}</div>
                      </div>
                    ))}
                  </div>
                  <button className="pc-btn is-sm" style={{ marginTop: 10 }}><Icon name="lock" size={11} />Unlock &amp; retry</button>
                </div>

                <div className="pc-panel pc-panel-pad">
                  <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Notifications sent</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {[
                      ["P. Menon", "is-rose", "PM", "4 questions reassigned"],
                      ["R. Banerjee", "is-teal", "RB", "12 questions reassigned"],
                      ["S. Krishnan", "is-violet", "SK", "8 questions reassigned"],
                      ["+ 2 more authors", null, null, "21 questions"],
                    ].map(([name, av, init, note], i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        {av ? <span className={"pc-avatar " + av} style={{ width: 22, height: 22, fontSize: 9.5 }}>{init}</span>
                            : <span style={{ width: 22, height: 22, borderRadius: 999, border: "1px dashed var(--pc-line-2)", display: "grid", placeItems: "center", color: "var(--pc-ink-4)", fontSize: 11 }}>+</span>}
                        <span style={{ fontSize: 12, color: "var(--pc-ink-2)", fontWeight: 500 }}>{name}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--pc-ink-4)" }}>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer CTA row */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 28 }}>
              <button className="pc-btn"><Icon name="archive" size={13} />Back to Repository</button>
              <button className="pc-btn is-ghost"><Icon name="sliders" size={13} />Start another bulk edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { BulkSelectRepo, BulkScope, BulkValues, BulkPreview, BulkComplete });
