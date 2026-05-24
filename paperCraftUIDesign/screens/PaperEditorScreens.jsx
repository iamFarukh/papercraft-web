// PaperEditorScreens.jsx — Examination Editor artboards (composed scenes)

// Common 3-column container
const EditorThreeCol = ({ left, center, right }) => (
  <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "304px 1fr 264px", overflow: "hidden" }}>
    <aside style={{ borderRight: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {left}
    </aside>
    {center}
    {right}
  </div>
);

// Read-only banner
const ReadOnlyBanner = () => (
  <div style={{
    margin: "0 auto 12px", maxWidth: 600, padding: "9px 14px",
    background: "var(--pc-success-bg)", border: "1px solid #B9E5CE", borderRadius: 8,
    display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#0E7A52",
  }}>
    <Icon name="lock" size={13} />
    <span style={{ fontWeight: 500 }}>This paper is approved and cannot be edited.</span>
    <span style={{ marginLeft: "auto", fontSize: 11, color: "#1F8B62" }}>Approved by Aarav Kapoor · 18 Sep 2025</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// ① STANDARD MODE · nothing selected
// ═══════════════════════════════════════════════════════════════════════════

const PE1_Standard = () => (
  <PEShell toolbarProps={{ surface: "edit", saved: "Saved · 4s ago" }}>
    <EditorThreeCol
      left={<>
        <StructureNavigator selectedKind="paper" />
        <DocumentInspector advanced={false} />
      </>}
      center={
        <EditorCanvas>
          <PrintHeader />
          <PrintInstructions />
          {PE_SECTIONS.slice(0, 1).map(sec => (
            <React.Fragment key={sec.id}>
              <PrintSectionHead sec={sec} />
              {sec.questions.slice(0, 4).map((q, i) => (
                <PrintQuestion key={q.id} n={i + 1} q={q} showOverride />
              ))}
            </React.Fragment>
          ))}
          <PageBreak n={1} total={4} />
          <ContinuationHeader text="Section A (continued)" />
          {PE_SECTIONS[0].questions.slice(4).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 5} q={q} showOverride />
          ))}
          <PrintSectionHead sec={PE_SECTIONS[1]} />
          {PE_SECTIONS[1].questions.slice(0, 3).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 7} q={q} />
          ))}
        </EditorCanvas>
      }
      right={<OfficialPreviewStrip />}
    />
  </PEShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ② STANDARD MODE · question selected (with inline controls)
// ═══════════════════════════════════════════════════════════════════════════

const PE2_QuestionSelected = () => (
  <PEShell toolbarProps={{ surface: "edit", saved: "Saved · 1s ago" }}>
    <EditorThreeCol
      left={<>
        <StructureNavigator selectedKind="question" selectedId="q3" />
        <QuestionInspector override={false} />
      </>}
      center={
        <EditorCanvas>
          <PrintHeader />
          <PrintInstructions />
          <PrintSectionHead sec={PE_SECTIONS[0]} />
          {PE_SECTIONS[0].questions.slice(0, 6).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 1} q={q} selected={q.id === "q3"} showOverride />
          ))}
          <PageBreak n={1} total={4} />
          <ContinuationHeader text="Section B (continued)" />
          {PE_SECTIONS[1].questions.slice(0, 2).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 7} q={q} />
          ))}
        </EditorCanvas>
      }
      right={<OfficialPreviewStrip />}
    />
  </PEShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ③ STANDARD MODE · section selected
// ═══════════════════════════════════════════════════════════════════════════

const PE3_SectionSelected = () => (
  <PEShell toolbarProps={{ surface: "edit", saved: "Saved · 12s ago" }}>
    <EditorThreeCol
      left={<>
        <StructureNavigator selectedKind="section" selectedId="A" />
        <SectionInspector />
      </>}
      center={
        <EditorCanvas>
          <PrintHeader />
          <PrintInstructions />
          <PrintSectionHead sec={PE_SECTIONS[0]} selected />
          {PE_SECTIONS[0].questions.slice(0, 5).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 1} q={q} />
          ))}
          <PageBreak n={1} total={4} />
          <ContinuationHeader text="Section A (continued)" />
          {PE_SECTIONS[0].questions.slice(5).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 6} q={q} />
          ))}
          <PrintSectionHead sec={PE_SECTIONS[1]} />
          {PE_SECTIONS[1].questions.slice(0, 2).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 7} q={q} />
          ))}
        </EditorCanvas>
      }
      right={<OfficialPreviewStrip />}
    />
  </PEShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ④ ADVANCED MODE · nothing selected (full inspector with all groups)
// ═══════════════════════════════════════════════════════════════════════════

const PE4_Advanced = () => (
  <PEShell toolbarProps={{ surface: "edit", saved: "Saved · 8s ago" }}>
    <EditorThreeCol
      left={<>
        <StructureNavigator selectedKind="paper" />
        <DocumentInspector advanced={true} />
      </>}
      center={
        <EditorCanvas showMarginGuides>
          <PrintHeader />
          <PrintInstructions />
          <PrintSectionHead sec={PE_SECTIONS[0]} />
          {PE_SECTIONS[0].questions.slice(0, 4).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 1} q={q} showOverride />
          ))}
          <PageBreak n={1} total={4} />
          <ContinuationHeader text="Section A (continued)" />
          {PE_SECTIONS[0].questions.slice(4).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 5} q={q} showOverride />
          ))}
          <PrintSectionHead sec={PE_SECTIONS[1]} />
          {PE_SECTIONS[1].questions.slice(0, 3).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 7} q={q} />
          ))}
        </EditorCanvas>
      }
      right={<OfficialPreviewStrip />}
    />
  </PEShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ⑤ ADVANCED MODE · question selected with floating toolbar + overrides
// ═══════════════════════════════════════════════════════════════════════════

const PE5_AdvancedQuestionSelected = () => (
  <PEShell toolbarProps={{ surface: "edit", saved: "Saved · just now" }}>
    <EditorThreeCol
      left={<>
        <StructureNavigator selectedKind="question" selectedId="q3" />
        <QuestionInspector override={true} />
      </>}
      center={
        <EditorCanvas>
          <PrintHeader />
          <PrintInstructions />
          <PrintSectionHead sec={PE_SECTIONS[0]} />
          {PE_SECTIONS[0].questions.slice(0, 6).map((q, i) => {
            const selected = q.id === "q3";
            return (
              <div key={q.id} style={{ position: "relative" }}>
                {selected && <FloatingToolbar />}
                <PrintQuestion n={i + 1} q={q} selected={selected} showOverride />
              </div>
            );
          })}
          <PageBreak n={1} total={4} />
          <ContinuationHeader text="Section B (continued)" />
          {PE_SECTIONS[1].questions.slice(0, 2).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 7} q={q} />
          ))}
        </EditorCanvas>
      }
      right={<OfficialPreviewStrip />}
    />
  </PEShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ⑥ PREVIEW SURFACE · clean
// ═══════════════════════════════════════════════════════════════════════════

const PE6_PreviewSurface = () => (
  <PEShell toolbarProps={{ surface: "preview", saved: "Saved · 24s ago" }}>
    <EditorThreeCol
      left={<>
        <StructureNavigator selectedKind={null} />
        <div style={{ padding: "14px 16px", flex: 1, overflow: "auto" }} className="pc-scroll">
          <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "14px 16px", boxShadow: "var(--pc-shadow-xs)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="eye" size={14} style={{ color: "var(--pc-primary)" }} />
              <span className="pc-serif" style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.015em" }}>Preview surface</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", marginTop: 6, lineHeight: 1.5 }}>
              You're viewing the paper as it will print. Selection outlines, inline controls and override markers are hidden. Switch back to the Edit surface to make changes.
            </div>
            <button className="pc-btn is-sm" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>
              <Icon name="edit" size={11} />Switch to Edit surface
            </button>
          </div>

          <div style={{ marginTop: 14 }}>
            <InsLabel style={{ marginBottom: 8 }}>Page navigation</InsLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[1, 2, 3, 4].map(p => (
                <button key={p} style={{
                  height: 28, padding: "0 10px", borderRadius: 6,
                  border: "1px solid " + (p === 1 ? "var(--pc-primary)" : "var(--pc-line)"),
                  background: p === 1 ? "var(--pc-primary-50)" : "var(--pc-surface)",
                  color: p === 1 ? "var(--pc-primary-ink)" : "var(--pc-ink-2)",
                  fontSize: 11.5, fontWeight: 500, fontFamily: "var(--pc-sans)", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "var(--pc-shadow-xs)",
                }}>
                  <span style={{ width: 16, height: 22, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", borderRadius: 2 }} />
                  Page {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </>}
      center={
        <EditorCanvas surface="preview">
          <PrintHeader />
          <PrintInstructions />
          <PrintSectionHead sec={PE_SECTIONS[0]} />
          {PE_SECTIONS[0].questions.slice(0, 5).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 1} q={q} />
          ))}
          <PageBreak n={1} total={4} />
          <ContinuationHeader text="Section A (continued)" />
          {PE_SECTIONS[0].questions.slice(5).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 6} q={q} />
          ))}
          <PrintSectionHead sec={PE_SECTIONS[1]} />
          {PE_SECTIONS[1].questions.slice(0, 3).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 7} q={q} />
          ))}
        </EditorCanvas>
      }
      right={<OfficialPreviewStrip />}
    />
  </PEShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ⑦ READ-ONLY MODE · approved paper
// ═══════════════════════════════════════════════════════════════════════════

const PE7_ReadOnly = () => (
  <PEShell toolbarProps={{ surface: "edit", saved: "Approved · locked", readOnly: true }}>
    <EditorThreeCol
      left={<>
        <StructureNavigator selectedKind="paper" />
        <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 22px", opacity: 0.7, pointerEvents: "none" }} className="pc-scroll">
          <div style={{ background: "var(--pc-success-bg)", border: "1px solid #B9E5CE", borderRadius: 8, padding: "11px 13px", marginBottom: 14, pointerEvents: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Icon name="lock" size={13} style={{ color: "#0E7A52" }} />
              <span style={{ fontSize: 11.5, color: "#0E7A52", fontWeight: 500 }}>Locked · paper approved</span>
            </div>
            <div style={{ fontSize: 11, color: "#1F8B62", marginTop: 4, lineHeight: 1.45 }}>
              All formatting controls are read-only. Export PDF is enabled from the Print preview.
            </div>
            <button className="pc-btn is-sm" style={{ marginTop: 8, width: "100%", justifyContent: "center", background: "white", borderColor: "#B9E5CE", color: "#0E7A52", pointerEvents: "auto" }}>
              <Icon name="download" size={11} />Open print preview
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[["Pages", 4], ["Questions", 22], ["Marks", 48]].map(([k, v]) => (
              <div key={k} style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                <div className="pc-serif pc-num" style={{ fontSize: 20, fontWeight: 500 }}>{v}</div>
                <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 4 }}>{k}</div>
              </div>
            ))}
          </div>

          <InsSectionTitle>Quick tuning</InsSectionTitle>
          <FormatSlider label="All questions — font" value="11.0" unit="pt" defaultPos={0.42} disabled />
          <FormatSlider label="All questions — spacing" value="3.0" unit="mm" defaultPos={0.30} disabled />
          <FormatSlider label="Section headers — font" value="13.0" unit="pt" defaultPos={0.52} disabled />
        </div>
      </>}
      center={
        <EditorCanvas banner={<ReadOnlyBanner />}>
          <PrintHeader />
          <PrintInstructions />
          <PrintSectionHead sec={PE_SECTIONS[0]} />
          {PE_SECTIONS[0].questions.slice(0, 5).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 1} q={q} />
          ))}
          <PageBreak n={1} total={4} />
          <ContinuationHeader text="Section A (continued)" />
          {PE_SECTIONS[0].questions.slice(5).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 6} q={q} />
          ))}
          <PrintSectionHead sec={PE_SECTIONS[1]} />
          {PE_SECTIONS[1].questions.slice(0, 3).map((q, i) => (
            <PrintQuestion key={q.id} n={i + 7} q={q} />
          ))}
        </EditorCanvas>
      }
      right={<OfficialPreviewStrip />}
    />
  </PEShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ⑧ PRINT PREVIEW PAGE (full-page route, not editor)
// ═══════════════════════════════════════════════════════════════════════════

const PE8_PrintPreview = () => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="teacher" active="builder" items={TEACHER_NAV}
        footName="Rajesh Sharma" footRole="Teacher · Social Science" footAvatar="RS" footAvatarClass="is-amber" />
      <div className="pc-work">
        <Topbar
          crumbs={["Academic", "Paper Builder", "Print Preview"]}
          actions={
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <button className="pc-btn is-sm"><Icon name="arrowLeft" size={11} />Back to editor</button>
              <button className="pc-btn is-sm"><Icon name="note" size={12} />Export DOCX</button>
              <button className="pc-btn is-primary is-sm"><Icon name="download" size={12} />Export PDF<Icon name="chevDown" size={10} /></button>
            </div>
          }
        />

        {/* Identity strip */}
        <div style={{ height: 52, borderBottom: "1px solid var(--pc-line)", background: "rgba(255,255,255,0.78)", padding: "0 22px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: 6, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", display: "grid", placeItems: "center" }}>
            <Icon name="file" size={13} style={{ color: "var(--pc-ink-3)" }} />
          </span>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="pc-serif" style={{ fontSize: 13.5, fontWeight: 500 }}>Class IX · Social Science · Half-Yearly</span>
              <span className="pc-tag is-success" style={{ height: 18, fontSize: 10 }}><Icon name="check" size={9} stroke={3} /> Approved</span>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>Final output · matches PDF export exactly</div>
          </div>
          <span style={{ flex: 1 }} />
          {/* Page jump */}
          <div style={{ display: "inline-flex", background: "var(--pc-surface-3)", borderRadius: 7, padding: 3, border: "1px solid var(--pc-line)" }}>
            {["Page 1", "Page 2", "Page 3", "Page 4"].map((p, i) => (
              <button key={p} style={{ height: 24, padding: "0 10px", border: 0, borderRadius: 5, background: i === 0 ? "var(--pc-surface)" : "transparent", color: i === 0 ? "var(--pc-ink)" : "var(--pc-ink-4)", fontSize: 11, fontWeight: 500, fontFamily: "var(--pc-sans)", cursor: "pointer", boxShadow: i === 0 ? "var(--pc-shadow-xs)" : "none" }}>{p}</button>
            ))}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 6 }}>
            <button className="pc-icon-btn" style={{ width: 28, height: 28 }}><Icon name="minus" size={12} /></button>
            <span className="pc-num" style={{ fontSize: 11.5, minWidth: 40, textAlign: "center", color: "var(--pc-ink-3)" }}>100%</span>
            <button className="pc-icon-btn" style={{ width: 28, height: 28 }}><Icon name="plus" size={12} /></button>
          </div>
        </div>

        <main className="pc-dots" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "32px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          {/* Page 1 */}
          <div className="pc-paper" style={{ width: 720, minHeight: 1018, padding: "44px 56px" }}>
            <PrintHeader />
            <PrintInstructions />
            <PrintSectionHead sec={PE_SECTIONS[0]} />
            {PE_SECTIONS[0].questions.slice(0, 6).map((q, i) => (
              <PrintQuestion key={q.id} n={i + 1} q={q} />
            ))}
            <div style={{ marginTop: 24, paddingTop: 10, borderTop: "1px dashed var(--pc-line)", display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--pc-ink-4)" }}>
              <span>Half-Yearly · 2025–26</span>
              <span>Page 1 of 4</span>
            </div>
          </div>

          {/* Page 2 */}
          <div className="pc-paper" style={{ width: 720, minHeight: 1018, padding: "44px 56px" }}>
            <ContinuationHeader text="Section B (continued)" />
            <PrintSectionHead sec={PE_SECTIONS[1]} />
            {PE_SECTIONS[1].questions.slice(0, 6).map((q, i) => (
              <PrintQuestion key={q.id} n={i + 7} q={q} />
            ))}
            <div style={{ marginTop: 24, paddingTop: 10, borderTop: "1px dashed var(--pc-line)", display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--pc-ink-4)" }}>
              <span>Half-Yearly · 2025–26</span>
              <span>Page 2 of 4</span>
            </div>
          </div>
        </main>
      </div>
    </div>

    {/* Floating export dropdown – open state */}
    <div style={{
      position: "absolute", top: 86, right: 28, width: 240,
      background: "var(--pc-surface)", borderRadius: 10, border: "1px solid var(--pc-line)",
      boxShadow: "var(--pc-shadow-lg)", padding: 6, zIndex: 10,
    }}>
      {[
        { i: "download", t: "Export as PDF",  s: "Print-ready · final output", on: true },
        { i: "note",     t: "Export as DOCX", s: "Editable Word document",     on: true },
        { i: "file",     t: "Print (browser)", s: "Print directly from browser", on: true },
      ].map(o => (
        <div key={o.t} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 10px", borderRadius: 6, cursor: "pointer", background: o.t === "Export as PDF" ? "var(--pc-primary-50)" : "transparent" }}>
          <span style={{ width: 26, height: 26, borderRadius: 6, background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", display: "grid", placeItems: "center", color: "var(--pc-ink-3)", flexShrink: 0 }}>
            <Icon name={o.i} size={13} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: o.t === "Export as PDF" ? "var(--pc-primary-ink)" : "var(--pc-ink)" }}>{o.t}</div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", marginTop: 1 }}>{o.s}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// DIALOG ARTBOARDS — each is a full screen with its dialog overlaid on PE1
// ═══════════════════════════════════════════════════════════════════════════

const DialogOverlay = ({ children, width = 520 }) => (
  <div style={{ position: "absolute", inset: 0, background: "rgba(20,22,26,0.42)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", display: "grid", placeItems: "center", zIndex: 30 }}>
    <div style={{ width, background: "var(--pc-surface)", borderRadius: 14, border: "1px solid var(--pc-line)", boxShadow: "var(--pc-shadow-lg)", overflow: "hidden" }}>
      {children}
    </div>
  </div>
);

const PE9_AdvancedConfirm = () => (
  <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <PE1_Standard />
    <DialogOverlay width={500}>
      <div style={{ padding: "22px 26px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--pc-warning-bg)", color: "var(--pc-warning)", display: "grid", placeItems: "center", border: "1px solid #F0D798" }}>
            <Icon name="warn" size={17} />
          </span>
          <div>
            <h3 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>Enable Advanced Layout?</h3>
            <div style={{ fontSize: 12, color: "var(--pc-ink-3)", marginTop: 2 }}>Full control over fonts, spacing, margins and per-element overrides.</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 26px 18px" }}>
        <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Please note</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 12.5, color: "var(--pc-ink-2)", lineHeight: 1.6 }}>
          <li>Changes may affect alignment and page breaks in unexpected ways.</li>
          <li>Extreme values can cause overflow or printing issues.</li>
          <li>Per-element overrides break global sync.</li>
          <li>Some combinations may not look good in print.</li>
        </ul>
        <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--pc-ink-4)", fontStyle: "italic" }}>You can reset to defaults at any time.</div>
      </div>
      <div style={{ padding: "14px 26px 20px", borderTop: "1px solid var(--pc-line)", display: "flex", gap: 8, justifyContent: "flex-end", background: "var(--pc-surface-2)" }}>
        <button className="pc-btn">Cancel</button>
        <button className="pc-btn is-primary">Enable Advanced Mode</button>
      </div>
    </DialogOverlay>
  </div>
);

const PE10_SmartFitToast = () => (
  <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <PE1_Standard />
    <div style={{
      position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: "var(--pc-ink)", color: "#F4F4F0", borderRadius: 10, padding: "12px 14px 12px 16px",
      boxShadow: "var(--pc-shadow-lg)", display: "flex", alignItems: "center", gap: 14, zIndex: 25,
      minWidth: 480,
    }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.10)", display: "grid", placeItems: "center", color: "#A6D4FF" }}>
        <Icon name="sparkles" size={16} />
      </span>
      <div style={{ flex: 1, lineHeight: 1.35 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "white" }}>Smart fit applied</div>
        <div style={{ fontSize: 11.5, color: "rgba(244,244,240,0.70)" }}>5 pages → <span style={{ color: "#7BD3A1", fontWeight: 500 }}>4 pages</span> · Font 11pt → 10pt · Density 3mm → 1.5mm</div>
      </div>
      <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "white", height: 28, padding: "0 12px", borderRadius: 6, fontSize: 12, fontFamily: "var(--pc-sans)", fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
        <Icon name="refresh" size={11} />Undo
      </button>
      <button style={{ width: 24, height: 24, borderRadius: 5, border: 0, background: "transparent", color: "rgba(244,244,240,0.55)", cursor: "pointer", display: "grid", placeItems: "center" }}>
        <Icon name="plus" size={13} style={{ transform: "rotate(45deg)" }} />
      </button>
    </div>
  </div>
);

const PE11_ResetConfirm = () => (
  <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <PE2_QuestionSelected />
    <DialogOverlay width={460}>
      <div style={{ padding: "22px 26px 14px" }}>
        <h3 className="pc-serif" style={{ fontSize: 17, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>Reset formatting?</h3>
        <div style={{ fontSize: 12.5, color: "var(--pc-ink-3)", marginTop: 6, lineHeight: 1.55 }}>
          This will reset spacing, typography and indentation for <strong style={{ color: "var(--pc-ink)", fontWeight: 500 }}>Question 3</strong> to global defaults.
        </div>
        <div style={{ marginTop: 12, padding: "10px 12px", background: "#F5F0FF", border: "1px solid #E0D4FA", borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 4, background: "#8B5CF6" }} />
            <span style={{ fontSize: 11.5, color: "#5B3FA8", fontWeight: 500 }}>3 overrides will be cleared</span>
          </div>
          <div style={{ fontSize: 11, color: "#7457B8", marginTop: 4, paddingLeft: 12 }}>· Space above: 5.0 → 3.0 mm</div>
          <div style={{ fontSize: 11, color: "#7457B8", paddingLeft: 12 }}>· Left indent: 12.0 → 8.0 mm</div>
          <div style={{ fontSize: 11, color: "#7457B8", paddingLeft: 12 }}>· Font size: 12.0 → 11.0 pt</div>
        </div>
      </div>
      <div style={{ padding: "14px 26px 20px", borderTop: "1px solid var(--pc-line)", display: "flex", gap: 8, justifyContent: "flex-end", background: "var(--pc-surface-2)" }}>
        <button className="pc-btn">Cancel</button>
        <button className="pc-btn is-primary">Reset to Defaults</button>
      </div>
    </DialogOverlay>
  </div>
);

const PE12_UnsavedDialog = () => (
  <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <PE1_Standard />
    <DialogOverlay width={440}>
      <div style={{ padding: "24px 26px 18px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--pc-info-bg)", color: "var(--pc-primary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon name="info" size={15} />
          </span>
          <div>
            <h3 className="pc-serif" style={{ fontSize: 16, fontWeight: 500, margin: 0, letterSpacing: "-0.018em" }}>Unsaved changes</h3>
            <div style={{ fontSize: 12.5, color: "var(--pc-ink-3)", marginTop: 6, lineHeight: 1.55 }}>
              You have unsaved formatting changes. Leave anyway?
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "14px 26px 20px", borderTop: "1px solid var(--pc-line)", display: "flex", gap: 8, justifyContent: "flex-end", background: "var(--pc-surface-2)" }}>
        <button className="pc-btn">Stay on page</button>
        <button className="pc-btn is-primary" style={{ background: "var(--pc-danger)", borderColor: "var(--pc-danger)" }}>Leave without saving</button>
      </div>
    </DialogOverlay>
  </div>
);

const PE13_SwitchToStandard = () => (
  <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <PE4_Advanced />
    <DialogOverlay width={500}>
      <div style={{ padding: "22px 26px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--pc-warning-bg)", color: "var(--pc-warning)", display: "grid", placeItems: "center", border: "1px solid #F0D798" }}>
            <Icon name="warn" size={17} />
          </span>
          <div>
            <h3 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>Switch to Standard mode?</h3>
            <div style={{ fontSize: 12, color: "var(--pc-ink-3)", marginTop: 2 }}>Your global formatting will be kept, but…</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 26px 18px" }}>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 12.5, color: "var(--pc-ink-2)", lineHeight: 1.7 }}>
          <li><strong style={{ fontWeight: 500, color: "#8B5CF6" }}>4 per-question overrides</strong> will be cleared.</li>
          <li><strong style={{ fontWeight: 500, color: "#8B5CF6" }}>1 per-section override</strong> will be cleared.</li>
          <li>Independent margin values will be linked.</li>
        </ul>
        <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--pc-danger)", fontStyle: "italic" }}>This cannot be undone.</div>
      </div>
      <div style={{ padding: "14px 26px 20px", borderTop: "1px solid var(--pc-line)", display: "flex", gap: 8, justifyContent: "flex-end", background: "var(--pc-surface-2)" }}>
        <button className="pc-btn">Cancel</button>
        <button className="pc-btn is-primary">Switch to Standard</button>
      </div>
    </DialogOverlay>
  </div>
);

Object.assign(window, {
  PE1_Standard, PE2_QuestionSelected, PE3_SectionSelected,
  PE4_Advanced, PE5_AdvancedQuestionSelected, PE6_PreviewSurface,
  PE7_ReadOnly, PE8_PrintPreview,
  PE9_AdvancedConfirm, PE10_SmartFitToast, PE11_ResetConfirm,
  PE12_UnsavedDialog, PE13_SwitchToStandard,
});
