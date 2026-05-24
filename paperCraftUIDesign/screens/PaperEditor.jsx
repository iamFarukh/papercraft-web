// PaperEditor.jsx — Examination Editor (Format mode) shared chrome + primitives
//
// Layout: 304 LEFT (Navigator + Inspector) | CENTER editable paper | 280 RIGHT (Official preview strip)
// Tokens follow PaperCraft palette — primary blue replaces the spec's amber.

// ───────────────────────────────────────────────────────────────────────────
// Mock paper data
// ───────────────────────────────────────────────────────────────────────────

const PE_SECTIONS = [
  { id: "A", title: "खंड A", subtitle: "Compulsory",
    instruction: "All questions in Section A are compulsory. Tick the most appropriate option.",
    questions: [
      { id: "q1", text: "भारतीय कृषि में हरित क्रांति के महत्व की व्याख्या कीजिए।", marks: 5, type: "LA" },
      { id: "q2", text: "फ्रांस का राष्ट्रगान क्या है और इसे कब अपनाया गया था?", marks: 1, type: "SA" },
      { id: "q3", text: "भारत का मानक समय ग्रीनविच मीन टाइम से ___ घंटे और 30 मिनट आगे है।", marks: 1, type: "FILL", override: true },
      { id: "q4", text: "Explain the major causes of the Industrial Revolution in Europe.", marks: 5, type: "LA" },
      { id: "q5", text: "Discuss the main features of Indian democracy with examples.", marks: 5, type: "LA" },
      { id: "q6", text: "In which year was the Constitution of India adopted?", marks: 1, type: "SA" },
    ]},
  { id: "B", title: "खंड B", subtitle: "Short answer",
    instruction: "Attempt any eight of the following short-answer questions.",
    questions: [
      { id: "q7",  text: "Which of the following rivers is known as the Sorrow of Bengal?", marks: 1, type: "MCQ", options: ["(a) Damodar", "(b) Hooghly", "(c) Ganga", "(d) Kosi"] },
      { id: "q8",  text: "The largest saltwater lake in India is ___ Lake.", marks: 1, type: "FILL" },
      { id: "q9",  text: "When did the Russian Revolution take place?", marks: 1, type: "SA" },
      { id: "q10", text: "Who was the first Prime Minister of independent India?", marks: 1, type: "SA" },
      { id: "q11", text: "What is the meaning of 'secular' in the Indian Constitution?", marks: 1, type: "SA" },
      { id: "q12", text: "Name the three branches of the Indian government.", marks: 1, type: "SA" },
    ]},
  { id: "C", title: "खंड C", subtitle: "Long answer",
    instruction: "Attempt any three of the following. Each answer should be in 80–100 words.",
    questions: [
      { id: "q19", text: "Explain the role of women in the Indian freedom struggle, with three examples.", marks: 5, type: "LA" },
      { id: "q20", text: "Discuss the impact of globalisation on Indian agriculture since 1991.", marks: 5, type: "LA" },
      { id: "q21", text: "Compare and contrast the Mughal and British administrative systems.", marks: 5, type: "LA" },
      { id: "q22", text: "How did the Non-Cooperation Movement change the nature of Indian politics?", marks: 5, type: "LA" },
    ]},
];

// ───────────────────────────────────────────────────────────────────────────
// Editor top toolbar (replaces the standard builder toolbar in editor route)
// ───────────────────────────────────────────────────────────────────────────

const PEToolbar = ({ surface = "edit", saved = "Saved · 4s ago", readOnly = false }) => (
  <div style={{
    height: 52, borderBottom: "1px solid var(--pc-line)",
    background: "rgba(255,255,255,0.78)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    padding: "0 22px", display: "flex", alignItems: "center", gap: 10,
  }}>
    <button className="pc-btn is-sm is-ghost"><Icon name="arrowLeft" size={12} />Back to compose</button>

    <span style={{ width: 1, height: 22, background: "var(--pc-line)", margin: "0 4px" }} />

    <span style={{ width: 28, height: 28, borderRadius: 6, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", display: "grid", placeItems: "center", boxShadow: "var(--pc-shadow-xs)" }}>
      <Icon name="file" size={13} style={{ color: "var(--pc-ink-3)" }} />
    </span>
    <div style={{ lineHeight: 1.2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="pc-serif" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--pc-ink)", letterSpacing: "-0.012em" }}>Class IX · Social Science · Half-Yearly</span>
        <span className={"pc-tag " + (readOnly ? "is-success" : "is-warning")} style={{ height: 18, fontSize: 10 }}>{readOnly ? "Approved" : "Draft"}</span>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", display: "flex", alignItems: "center", gap: 5 }}>
        {!readOnly && <><Icon name="check" size={9} style={{ color: "var(--pc-success)" }} /></>}
        <span>{saved}</span>
      </div>
    </div>

    {/* Surface segmented control */}
    <div style={{ marginLeft: 24, display: "inline-flex", background: "var(--pc-surface-3)", borderRadius: 7, padding: 3, border: "1px solid var(--pc-line)" }}>
      {["Edit surface", "Preview surface"].map((p, i) => {
        const active = (surface === "edit" && i === 0) || (surface === "preview" && i === 1);
        return (
          <button key={p} style={{
            height: 24, padding: "0 12px", border: 0, borderRadius: 5,
            background: active ? "var(--pc-surface)" : "transparent",
            color: active ? "var(--pc-ink)" : "var(--pc-ink-4)",
            cursor: "pointer", fontSize: 11.5, fontFamily: "var(--pc-sans)", fontWeight: 500,
            boxShadow: active ? "var(--pc-shadow-xs)" : "none",
            display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <Icon name={i === 0 ? "edit" : "eye"} size={11} />
            {p}
          </button>
        );
      })}
    </div>

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
      <button className="pc-btn is-sm"><Icon name="history" size={12} />History</button>
      <button className="pc-btn is-sm"><Icon name="download" size={12} />Export</button>
      <button className="pc-btn is-sm"><Icon name="expand" size={12} />Full preview<Icon name="arrowRight" size={11} /></button>
    </div>
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
// LEFT PANEL — Structure Navigator
// ───────────────────────────────────────────────────────────────────────────

const StructureNavigator = ({ selectedId = null, selectedKind = null }) => (
  <div style={{ borderBottom: "1px solid var(--pc-line)", maxHeight: 320, overflow: "auto", padding: "12px 0 8px" }} className="pc-scroll">
    <div style={{ padding: "0 14px 8px", display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Outline</span>
      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--pc-ink-4)" }}>
        <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>22</span> Q · <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>48</span> m
      </span>
    </div>

    {/* Paper root */}
    <div style={{
      margin: "0 8px 4px", padding: "7px 9px", display: "flex", alignItems: "center", gap: 8,
      borderRadius: 6, cursor: "pointer",
      background: selectedKind === "paper" ? "var(--pc-primary-50)" : "transparent",
      boxShadow: selectedKind === "paper" ? "inset 2px 0 0 var(--pc-primary)" : "none",
    }}>
      <Icon name="file" size={13} style={{ color: selectedKind === "paper" ? "var(--pc-primary)" : "var(--pc-ink-4)" }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: selectedKind === "paper" ? "var(--pc-primary-ink)" : "var(--pc-ink-2)" }}>Examination</span>
    </div>

    {PE_SECTIONS.map(sec => {
      const sectionSelected = selectedKind === "section" && selectedId === sec.id;
      return (
        <div key={sec.id}>
          <div style={{
            margin: "6px 8px 2px", padding: "7px 9px", display: "flex", alignItems: "center", gap: 8,
            borderRadius: 6, cursor: "pointer",
            background: sectionSelected ? "var(--pc-primary-50)" : "transparent",
            boxShadow: sectionSelected ? "inset 2px 0 0 var(--pc-primary)" : "none",
          }}>
            <Icon name="drag" size={11} style={{ color: "var(--pc-ink-5)" }} />
            <span className="pc-serif" style={{ fontSize: 12.5, fontWeight: 500, color: sectionSelected ? "var(--pc-primary-ink)" : "var(--pc-ink)", letterSpacing: "-0.01em" }}>
              Section {sec.id}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)" }}>
              <span className="pc-num" style={{ color: "var(--pc-ink-2)" }}>{sec.questions.length}</span>q · <span className="pc-num" style={{ color: "var(--pc-ink-2)" }}>{sec.questions.reduce((a, q) => a + q.marks, 0)}</span>m
            </span>
          </div>
          {sec.questions.map((q, qi) => {
            const qSelected = selectedKind === "question" && selectedId === q.id;
            return (
              <div key={q.id} style={{
                margin: "0 8px", padding: "4.5px 9px 4.5px 24px", display: "flex", alignItems: "center", gap: 6,
                borderRadius: 5, cursor: "pointer",
                background: qSelected ? "var(--pc-primary-50)" : "transparent",
                boxShadow: qSelected ? "inset 2px 0 0 var(--pc-primary)" : "none",
              }}>
                {q.override && <span style={{ width: 5, height: 5, borderRadius: 3, background: "#8B5CF6", flexShrink: 0 }} />}
                <span className="pc-mono" style={{ fontSize: 10, color: qSelected ? "var(--pc-primary)" : "var(--pc-ink-4)", width: 18 }}>Q{qi + 1 + (sec.id === "B" ? 6 : sec.id === "C" ? 18 : 0)}</span>
                <span style={{ fontSize: 11.5, color: qSelected ? "var(--pc-primary-ink)" : "var(--pc-ink-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: qSelected ? 500 : 400 }}>{q.text}</span>
                <span className="pc-num" style={{ fontSize: 10.5, color: "var(--pc-ink-4)", flexShrink: 0 }}>{q.marks}</span>
              </div>
            );
          })}
        </div>
      );
    })}
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
// Inspector primitives
// ───────────────────────────────────────────────────────────────────────────

const InsLabel = ({ children, style }) => (
  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, ...style }}>{children}</div>
);

const InsSectionTitle = ({ children, chev = "down" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 0 8px", cursor: "pointer" }}>
    <Icon name={chev === "down" ? "chevDown" : "chev"} size={12} style={{ color: "var(--pc-ink-4)" }} />
    <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{children}</span>
    <span style={{ flex: 1, height: 1, background: "var(--pc-line)", marginLeft: 4 }} />
  </div>
);

const FormatSlider = ({ label, value, unit = "pt", min = 6, max = 24, defaultPos = 0.45, danger = false, warning = false, override = false, globalValue = null, disabled = false }) => {
  const pos = defaultPos;
  return (
    <div style={{ marginTop: 12, opacity: disabled ? 0.55 : 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 11.5, color: "var(--pc-ink-2)", fontWeight: 500 }}>{label}</span>
        <span style={{ flex: 1 }} />
        {override && <Icon name="refresh" size={10} style={{ color: "var(--pc-ink-4)", cursor: "pointer" }} />}
        <span className="pc-num" style={{ fontSize: 11.5, color: override ? "#8B5CF6" : "var(--pc-ink-2)", fontWeight: 500 }}>
          {value}
          <span style={{ color: "var(--pc-ink-4)", fontWeight: 400 }}> {unit}</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 16 }}>
        <div style={{
          position: "absolute", top: 6, left: 0, right: 0, height: 4, borderRadius: 999,
          background: danger ? "#FECACA" : warning ? "#FDE68A" : "var(--pc-surface-3)",
        }} />
        <div style={{
          position: "absolute", top: 6, left: 0, width: `${pos * 100}%`, height: 4, borderRadius: 999,
          background: danger ? "var(--pc-danger)" : warning ? "var(--pc-warning)" : override ? "#8B5CF6" : "var(--pc-primary)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: `calc(${pos * 100}% - 8px)`,
          width: 16, height: 16, borderRadius: 999, background: "var(--pc-surface)",
          border: "1px solid var(--pc-line-2)", boxShadow: "var(--pc-shadow-xs)",
        }} />
      </div>
      {globalValue != null && (
        <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", marginTop: 4, fontStyle: "italic" }}>
          global: {globalValue}{unit}
        </div>
      )}
    </div>
  );
};

const ToggleGroup = ({ options, active, dense = false }) => (
  <div style={{ display: "inline-flex", width: "100%", background: "var(--pc-surface-2)", borderRadius: 7, padding: 3, border: "1px solid var(--pc-line)" }}>
    {options.map((o, i) => {
      const isOn = active === i;
      return (
        <button key={i} style={{
          flex: 1, height: dense ? 24 : 28, border: 0, borderRadius: 5,
          background: isOn ? "var(--pc-surface)" : "transparent",
          color: isOn ? "var(--pc-ink)" : "var(--pc-ink-4)",
          fontSize: 11.5, fontWeight: 500, fontFamily: "var(--pc-sans)", cursor: "pointer",
          boxShadow: isOn ? "var(--pc-shadow-xs)" : "none",
        }}>{o}</button>
      );
    })}
  </div>
);

const PresetCard = ({ label, active, sketch }) => (
  <div style={{
    flex: 1, border: "1px solid " + (active ? "var(--pc-primary)" : "var(--pc-line)"),
    borderRadius: 9, padding: 8, background: active ? "var(--pc-primary-50)" : "var(--pc-surface)",
    boxShadow: active ? "0 0 0 3px rgba(53,92,255,0.10)" : "var(--pc-shadow-xs)",
    cursor: "pointer", textAlign: "center",
  }}>
    <div style={{
      height: 64, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", borderRadius: 5,
      display: "flex", flexDirection: "column", padding: "4px 5px", gap: 2, alignItems: "stretch",
    }}>
      {sketch}
    </div>
    <div style={{ fontSize: 11, fontWeight: 500, color: active ? "var(--pc-primary-ink)" : "var(--pc-ink-3)", marginTop: 6 }}>{label}</div>
  </div>
);

const HeaderPresetSketch = ({ size = "med" }) => {
  const heights = size === "sm" ? [4, 6] : size === "md" ? [6, 8] : [10, 14];
  const fill = "rgba(20,22,26,0.30)";
  return (
    <>
      <div style={{ height: heights[1], background: fill, borderRadius: 1 }} />
      <div style={{ height: heights[0], background: "rgba(20,22,26,0.18)", borderRadius: 1, width: "70%", alignSelf: "center" }} />
      <div style={{ borderTop: "1px solid rgba(20,22,26,0.18)", marginTop: 2, paddingTop: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ height: 2, background: "rgba(20,22,26,0.10)", borderRadius: 1 }} />
        <div style={{ height: 2, background: "rgba(20,22,26,0.10)", borderRadius: 1 }} />
        <div style={{ height: 2, background: "rgba(20,22,26,0.10)", borderRadius: 1, width: "60%" }} />
      </div>
    </>
  );
};

const FieldInput = ({ label, value, multiline = false, optional = false }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }}>
    <InsLabel>{label}{optional && <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--pc-ink-5)", fontWeight: 400, marginLeft: 4 }}>optional</span>}</InsLabel>
    {multiline ? (
      <textarea defaultValue={value} rows={3} style={{
        padding: "8px 10px", borderRadius: 6, border: "1px solid var(--pc-line)",
        background: "var(--pc-surface-2)", fontSize: 12, fontFamily: "var(--pc-sans)", color: "var(--pc-ink)",
        outline: "none", boxShadow: "var(--pc-shadow-xs)", resize: "vertical",
      }} />
    ) : (
      <input defaultValue={value} style={{
        height: 30, padding: "0 10px", borderRadius: 6, border: "1px solid var(--pc-line)",
        background: "var(--pc-surface-2)", fontSize: 12, fontFamily: "var(--pc-sans)", color: "var(--pc-ink)",
        outline: "none", boxShadow: "var(--pc-shadow-xs)",
      }} />
    )}
  </label>
);

const Checkbox = ({ label, checked = false }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: "pointer", fontSize: 12, color: "var(--pc-ink-2)" }}>
    <span style={{
      width: 15, height: 15, borderRadius: 4,
      border: "1px solid " + (checked ? "var(--pc-primary)" : "var(--pc-line-2)"),
      background: checked ? "var(--pc-primary)" : "var(--pc-surface)",
      display: "grid", placeItems: "center", flexShrink: 0,
      boxShadow: "var(--pc-shadow-xs)",
    }}>
      {checked && <Icon name="check" size={9} stroke={3} style={{ color: "white" }} />}
    </span>
    <span>{label}</span>
  </label>
);

// ───────────────────────────────────────────────────────────────────────────
// DOCUMENT INSPECTOR — paper level
// ───────────────────────────────────────────────────────────────────────────

const DocumentInspector = ({ advanced = false }) => (
  <div className="pc-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 16px 22px" }}>
    {/* Stats hero */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
      {[["Pages", 4], ["Questions", 22], ["Marks", 48]].map(([k, v], i) => (
        <div key={k} style={{
          background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 8,
          padding: "10px 8px", textAlign: "center", boxShadow: "var(--pc-shadow-xs)",
        }}>
          <div className="pc-serif pc-num" style={{ fontSize: 20, fontWeight: 500, color: "var(--pc-ink)", lineHeight: 1, letterSpacing: "-0.02em" }}>{v}</div>
          <div style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 4 }}>{k}</div>
        </div>
      ))}
    </div>

    {/* Layout mode */}
    <div style={{ marginTop: 16 }}>
      <InsLabel style={{ marginBottom: 6 }}>Layout mode</InsLabel>
      <ToggleGroup options={["Standard", "Advanced"]} active={advanced ? 1 : 0} />
    </div>

    {/* Header presets */}
    <InsSectionTitle>Header</InsSectionTitle>
    <div style={{ display: "flex", gap: 6 }}>
      <PresetCard label="Compact"  active={true}  sketch={<HeaderPresetSketch size="sm" />} />
      <PresetCard label="Standard" active={false} sketch={<HeaderPresetSketch size="md" />} />
      <PresetCard label="Spacious" active={false} sketch={<HeaderPresetSketch size="lg" />} />
    </div>
    <button className="pc-btn is-sm" style={{ marginTop: 10, width: "100%", justifyContent: "center", background: "var(--pc-primary-50)", color: "var(--pc-primary-ink)", borderColor: "var(--pc-primary-100)" }}>
      <Icon name="sparkles" size={11} />Smart fit · reduce to 3 pages
    </button>

    {/* Quick tuning */}
    <InsSectionTitle>Quick tuning</InsSectionTitle>
    <FormatSlider label="All questions — font" value="11.0" unit="pt" defaultPos={0.42} />
    <FormatSlider label="All questions — spacing" value="3.0" unit="mm" defaultPos={0.30} />
    <FormatSlider label="Section headers — font" value="13.0" unit="pt" defaultPos={0.52} />

    <div style={{ marginTop: 14 }}>
      <InsLabel style={{ marginBottom: 6 }}>Marks style</InsLabel>
      <ToggleGroup options={["[5]", "(5)", "Off"]} active={0} />
    </div>

    <div style={{ marginTop: 12 }}>
      <InsLabel style={{ marginBottom: 6 }}>Typeface</InsLabel>
      <ToggleGroup options={["Sans", "Serif"]} active={1} />
    </div>

    {/* Page margins */}
    <InsSectionTitle>Page margins</InsSectionTitle>
    <ToggleGroup options={["Tight", "Normal", "Wide"]} active={1} />
    <FormatSlider label="All margins" value="15" unit="mm" defaultPos={0.40} />
    <Checkbox label="Link margins" checked />

    {/* Standard-only short groups */}
    {!advanced && (
      <>
        <InsSectionTitle chev="right">Branding</InsSectionTitle>
        <InsSectionTitle chev="right">Examination</InsSectionTitle>
        <InsSectionTitle chev="right">Header & page</InsSectionTitle>
      </>
    )}

    {/* Advanced extra groups */}
    {advanced && (
      <>
        <InsSectionTitle>Typography</InsSectionTitle>
        <FormatSlider label="Question text" value="11.0" unit="pt" defaultPos={0.42} />
        <FormatSlider label="MCQ options" value="10.0" unit="pt" defaultPos={0.35} />
        <FormatSlider label="Instructions" value="10.0" unit="pt" defaultPos={0.35} />
        <FormatSlider label="Marks labels" value="9.0" unit="pt" defaultPos={0.25} warning />
        <FormatSlider label="Line height" value="1.35" unit="×" defaultPos={0.45} />

        <InsSectionTitle>Spacing</InsSectionTitle>
        <FormatSlider label="Between questions" value="3.0" unit="mm" defaultPos={0.30} />
        <FormatSlider label="Between sections" value="6.0" unit="mm" defaultPos={0.55} />
        <FormatSlider label="After section header" value="2.0" unit="mm" defaultPos={0.18} />
        <FormatSlider label="MCQ option gap" value="1.5" unit="mm" defaultPos={0.15} />
        <FormatSlider label="MCQ option indent" value="6.0" unit="mm" defaultPos={0.30} />
        <FormatSlider label="Question left indent" value="8.0" unit="mm" defaultPos={0.40} />

        <InsSectionTitle chev="right">Header (per-field)</InsSectionTitle>
        <InsSectionTitle chev="right">Dividers</InsSectionTitle>
        <InsSectionTitle chev="right">Marks display</InsSectionTitle>
        <InsSectionTitle chev="right">Footer</InsSectionTitle>
      </>
    )}
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
// QUESTION INSPECTOR
// ───────────────────────────────────────────────────────────────────────────

const QuestionInspector = ({ override = false }) => (
  <div className="pc-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 16px 22px" }}>
    <button className="pc-btn is-sm is-ghost" style={{ padding: "0 4px", height: 24 }}><Icon name="arrowLeft" size={11} />Back to document</button>

    <div style={{ marginTop: 10, paddingBottom: 12, borderBottom: "1px solid var(--pc-line)" }}>
      <div className="pc-serif" style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.018em" }}>Question 3</div>
      <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginTop: 2 }}>
        Section A · <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>1</span> mark · Fill-in-the-blank
      </div>
    </div>

    {override && (
      <div style={{ marginTop: 12, padding: "10px 12px", background: "#F5F0FF", border: "1px solid #E0D4FA", borderRadius: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: "#8B5CF6" }} />
          <span style={{ fontSize: 11.5, color: "#5B3FA8", fontWeight: 500 }}>Custom overrides active</span>
        </div>
        <div style={{ fontSize: 11, color: "#7457B8", marginTop: 3 }}>3 properties differ from global</div>
        <button className="pc-btn is-sm" style={{ marginTop: 8, height: 24, background: "transparent", border: "1px solid #E0D4FA", color: "#5B3FA8", boxShadow: "none" }}>Reset all to global</button>
      </div>
    )}

    <InsSectionTitle>Spacing & layout</InsSectionTitle>
    <FormatSlider label="Space above" value={override ? "5.0" : "3.0"} unit="mm" defaultPos={override ? 0.50 : 0.30} override={override} globalValue={override ? "3.0" : null} />
    <FormatSlider label="Space below" value="3.0" unit="mm" defaultPos={0.30} globalValue={override ? "3.0" : null} />
    <FormatSlider label="Left indent" value={override ? "12.0" : "8.0"} unit="mm" defaultPos={override ? 0.55 : 0.40} override={override} globalValue={override ? "8.0" : null} />

    <InsSectionTitle>Typography</InsSectionTitle>
    <FormatSlider label="Font size" value={override ? "12.0" : "11.0"} unit="pt" defaultPos={override ? 0.50 : 0.42} override={override} globalValue={override ? "11.0" : null} />

    <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--pc-line)", display: "flex", flexDirection: "column", gap: 8 }}>
      <button className="pc-btn is-sm" style={{ justifyContent: "center" }}>Apply to all in Section A</button>
      <button className="pc-btn is-sm is-ghost" style={{ justifyContent: "center" }}>Apply to all questions</button>
    </div>

    <InsSectionTitle>Behavior</InsSectionTitle>
    <Checkbox label="Start on new page" />
    <Checkbox label="Keep with next question" />

    <InsSectionTitle>Marks & numbering</InsSectionTitle>
    <div style={{ marginTop: 6 }}>
      <InsLabel style={{ marginBottom: 6 }}>Marks override</InsLabel>
      <div style={{ display: "flex", gap: 6 }}>
        <select defaultValue="global" style={{ flex: 1, height: 28, padding: "0 8px", borderRadius: 6, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", fontSize: 12, fontFamily: "var(--pc-sans)", color: "var(--pc-ink-2)", outline: "none" }}>
          <option value="global">Use global · 1 mark</option>
          <option value="custom">Custom value…</option>
        </select>
      </div>
    </div>
    <div style={{ marginTop: 10 }}>
      <InsLabel style={{ marginBottom: 6 }}>Numbering</InsLabel>
      <ToggleGroup options={["Auto", "Custom", "Hidden"]} active={0} />
    </div>
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
// SECTION INSPECTOR
// ───────────────────────────────────────────────────────────────────────────

const SectionInspector = () => (
  <div className="pc-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 16px 22px" }}>
    <button className="pc-btn is-sm is-ghost" style={{ padding: "0 4px", height: 24 }}><Icon name="arrowLeft" size={11} />Back to document</button>

    <div style={{ marginTop: 10, paddingBottom: 12, borderBottom: "1px solid var(--pc-line)" }}>
      <div className="pc-serif" style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.018em" }}>Section A</div>
      <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginTop: 2 }}>
        <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>6</span> questions · <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>18</span> marks
      </div>
    </div>

    <FieldInput label="Section title" value="खंड A" />
    <FieldInput label="Section subtitle" value="Compulsory" />
    <FieldInput label="Section instructions" value="All questions in Section A are compulsory. Tick the most appropriate option." multiline />

    <InsSectionTitle>Spacing</InsSectionTitle>
    <FormatSlider label="Space above section" value="6.0" unit="mm" defaultPos={0.55} globalValue="6.0" />
    <FormatSlider label="After section header" value="2.0" unit="mm" defaultPos={0.18} globalValue="2.0" />
    <FormatSlider label="Between questions" value="3.0" unit="mm" defaultPos={0.30} globalValue="3.0" />
    <FormatSlider label="Section header font size" value="13.0" unit="pt" defaultPos={0.52} globalValue="13.0" />

    <InsSectionTitle>Layout</InsSectionTitle>
    <div>
      <InsLabel style={{ marginBottom: 6 }}>Columns</InsLabel>
      <ToggleGroup options={["1 column", "2 columns"]} active={0} />
    </div>
    <div style={{ marginTop: 12 }}>
      <Checkbox label="Start on new page" />
      <Checkbox label="Show section numbering" checked />
      <Checkbox label="Hide section on paper" />
    </div>

    <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--pc-line)", display: "flex", flexDirection: "column", gap: 8 }}>
      <button className="pc-btn is-sm" style={{ justifyContent: "center" }}>Apply to all sections</button>
      <button className="pc-btn is-sm is-ghost" style={{ justifyContent: "center" }}>Reset to global</button>
    </div>

    <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
      <button className="pc-btn is-sm" style={{ flex: 1, justifyContent: "center" }}><Icon name="arrowLeft" size={11} style={{ transform: "rotate(90deg)" }} />Move up</button>
      <button className="pc-btn is-sm" style={{ flex: 1, justifyContent: "center" }}><Icon name="arrowRight" size={11} style={{ transform: "rotate(90deg)" }} />Move down</button>
    </div>
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
// CENTER PANEL — Editable paper
// ───────────────────────────────────────────────────────────────────────────

const PrintHeader = ({ compact = true }) => (
  <div style={{ textAlign: "center", paddingBottom: compact ? 10 : 14, borderBottom: "1.5px solid var(--pc-ink)" }}>
    <div className="pc-serif" style={{ fontSize: compact ? 15 : 18, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      Saraswati Vidya Niketan
    </div>
    <div style={{ fontSize: 9.5, color: "var(--pc-ink-3)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 2 }}>
      Senior Secondary · Estd. 1962 · Lucknow
    </div>
    <div style={{ marginTop: 7, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
      <span style={{ flex: 1, height: 1, background: "var(--pc-ink-4)", opacity: 0.35 }} />
      <span className="pc-serif" style={{ fontSize: 12.5, fontStyle: "italic" }}>Half-Yearly Examination · 2025–26 · Term II</span>
      <span style={{ flex: 1, height: 1, background: "var(--pc-ink-4)", opacity: 0.35 }} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, padding: "0 4px", fontSize: 10.5, color: "var(--pc-ink-2)" }}>
      <span>कक्षा <strong style={{ fontWeight: 500 }}>IX</strong></span>
      <span>विषय <strong style={{ fontWeight: 500 }}>Social Science</strong></span>
      <span>समय <strong style={{ fontWeight: 500 }}>3 hours</strong></span>
      <span>पूर्णांक <strong style={{ fontWeight: 500 }}>48</strong></span>
    </div>
  </div>
);

const PrintInstructions = () => (
  <div style={{ marginTop: 12, fontSize: 10.5, color: "var(--pc-ink-2)", lineHeight: 1.55 }}>
    <div className="pc-serif" style={{ fontSize: 11.5, fontWeight: 500, textAlign: "center", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>सामान्य निर्देश · General Instructions</div>
    <ol style={{ margin: "0 0 0 20px", padding: 0, color: "var(--pc-ink-3)" }}>
      <li>सभी प्रश्न अनिवार्य हैं जब तक अन्यथा न कहा जाए।</li>
      <li>दाईं ओर दिए अंक पूर्ण अंक दर्शाते हैं।</li>
      <li>Section A contains compulsory short questions. Section B has internal choice. Section C is long-answer.</li>
    </ol>
  </div>
);

const PrintSectionHead = ({ sec, selected = false }) => (
  <div style={{
    marginTop: 14, padding: selected ? "8px 10px" : "10px 0 4px",
    border: selected ? "1.5px solid var(--pc-primary)" : 0,
    borderRadius: selected ? 6 : 0,
    background: selected ? "rgba(53,92,255,0.04)" : "transparent",
    boxShadow: selected ? "0 0 0 3px rgba(53,92,255,0.10)" : "none",
    borderBottom: selected ? "1.5px solid var(--pc-primary)" : "1px dashed var(--pc-line-2)",
    position: "relative",
  }}>
    <div style={{ display: "flex", alignItems: "baseline" }}>
      <span className="pc-serif" style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em" }}>
        {sec.title} <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>· {sec.subtitle}</span>
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 10.5, color: "var(--pc-ink-3)" }}>
        <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{sec.questions.length}</span> Q · <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{sec.questions.reduce((a, q) => a + q.marks, 0)}</span> अंक
      </span>
    </div>
    <div style={{ fontSize: 10.5, color: "var(--pc-ink-3)", fontStyle: "italic", marginTop: 3 }}>{sec.instruction}</div>
  </div>
);

const PrintQuestion = ({ n, q, selected = false, surface = "edit", showOverride = false, inlineMode = "default" }) => (
  <div style={{
    marginTop: 9, position: "relative",
    padding: selected ? "10px 12px" : "0",
    border: selected ? "1.5px solid var(--pc-primary)" : 0,
    borderRadius: selected ? 6 : 0,
    background: selected ? "rgba(53,92,255,0.04)" : "transparent",
    boxShadow: selected ? "0 0 0 3px rgba(53,92,255,0.10)" : "none",
  }}>
    <div style={{ display: "grid", gridTemplateColumns: "26px 1fr 36px", gap: 10, alignItems: "baseline" }}>
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
        {showOverride && q.override && <span style={{ width: 5, height: 5, borderRadius: 3, background: "#8B5CF6", display: "inline-block" }} />}
        <span className="pc-serif pc-num" style={{ fontSize: 12, fontWeight: 500, color: "var(--pc-ink)" }}>{n}.</span>
      </span>
      <div>
        <div className="pc-serif" style={{ fontSize: 12, color: "var(--pc-ink)", lineHeight: 1.55, letterSpacing: "-0.003em" }}>{q.text}</div>
        {q.options && (
          <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 14, rowGap: 3 }}>
            {q.options.map((o, i) => (
              <span key={i} className="pc-serif" style={{ fontSize: 11.5, color: "var(--pc-ink-2)" }}>{o}</span>
            ))}
          </div>
        )}
      </div>
      <span style={{ fontSize: 10.5, color: "var(--pc-ink-3)", textAlign: "right" }}>[<span className="pc-num" style={{ fontWeight: 500, color: "var(--pc-ink)" }}>{q.marks}</span>]</span>
    </div>

    {/* Inline controls when selected */}
    {selected && surface === "edit" && inlineMode === "default" && (
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed var(--pc-line)", display: "flex", alignItems: "center", gap: 6 }}>
        <InlineChip>{q.marks} mark{q.marks > 1 ? "s" : ""} <Icon name="chevDown" size={9} /></InlineChip>
        <InlineChip>Compact <Icon name="chevDown" size={9} /></InlineChip>
        <InlineChip>Auto # <Icon name="chevDown" size={9} /></InlineChip>
        <button style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--pc-line)", background: "var(--pc-surface)", color: "var(--pc-ink-3)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="dots" size={12} /></button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", fontStyle: "italic" }}>Click value to edit</span>
      </div>
    )}
    {selected && surface === "edit" && inlineMode === "default" && (
      <input placeholder="Local instruction (optional) — e.g. Attempt any three." style={{
        marginTop: 6, width: "100%", height: 28, padding: "0 10px", borderRadius: 6,
        border: "1px dashed var(--pc-line-2)", background: "var(--pc-surface)",
        fontSize: 11, fontFamily: "var(--pc-serif)", fontStyle: "italic", color: "var(--pc-ink-3)",
        outline: "none",
      }} />
    )}
  </div>
);

const InlineChip = ({ children, override = false }) => (
  <button style={{
    height: 22, padding: "0 7px", borderRadius: 5, fontFamily: "var(--pc-sans)",
    border: "1px solid var(--pc-line)",
    borderLeft: override ? "3px solid #8B5CF6" : "1px solid var(--pc-line)",
    background: "var(--pc-surface)",
    color: "var(--pc-ink-2)", fontSize: 10.5, fontWeight: 500, cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 4,
    boxShadow: "var(--pc-shadow-xs)",
  }}>{children}</button>
);

// Floating toolbar (advanced mode pattern — Section 15 of spec)
const FloatingToolbar = () => (
  <div style={{
    position: "absolute", top: -42, left: "50%", transform: "translateX(-50%)",
    background: "var(--pc-surface)", borderRadius: 8, padding: "5px 7px",
    border: "1px solid var(--pc-line)", boxShadow: "var(--pc-shadow-lg)",
    display: "flex", alignItems: "center", gap: 6, zIndex: 5, whiteSpace: "nowrap",
  }}>
    <span style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>Space</span>
    <button style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", cursor: "pointer", color: "var(--pc-ink-3)", display: "grid", placeItems: "center" }}><Icon name="minus" size={11} /></button>
    <span className="pc-num" style={{ minWidth: 36, textAlign: "center", fontSize: 12, fontWeight: 500, color: "#8B5CF6" }}>5.0<span style={{ color: "var(--pc-ink-4)", fontWeight: 400 }}>mm</span></span>
    <button style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", cursor: "pointer", color: "var(--pc-ink-3)", display: "grid", placeItems: "center" }}><Icon name="plus" size={11} /></button>

    <span style={{ width: 1, height: 16, background: "var(--pc-line)", margin: "0 2px" }} />

    <span style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>Indent</span>
    <button style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", cursor: "pointer", color: "var(--pc-ink-3)", display: "grid", placeItems: "center" }}><Icon name="minus" size={11} /></button>
    <span className="pc-num" style={{ minWidth: 38, textAlign: "center", fontSize: 12, fontWeight: 500, color: "#8B5CF6" }}>12.0<span style={{ color: "var(--pc-ink-4)", fontWeight: 400 }}>mm</span></span>
    <button style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", cursor: "pointer", color: "var(--pc-ink-3)", display: "grid", placeItems: "center" }}><Icon name="plus" size={11} /></button>

    <span style={{ width: 1, height: 16, background: "var(--pc-line)", margin: "0 2px" }} />

    <button style={{ width: 22, height: 22, borderRadius: 5, border: 0, background: "transparent", cursor: "pointer", color: "var(--pc-ink-3)", display: "grid", placeItems: "center" }}><Icon name="dots" size={12} /></button>
  </div>
);

const PageBreak = ({ n = 2, total = 4 }) => (
  <div style={{ display: "flex", alignItems: "center", margin: "18px 0 14px", gap: 8 }}>
    <span style={{ flex: 1, borderTop: "1px dashed #C8CBD2" }} />
    <span style={{ fontSize: 10, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Page {n} of {total}</span>
    <span style={{ flex: 1, borderTop: "1px dashed #C8CBD2" }} />
  </div>
);

const ContinuationHeader = ({ text = "Section C (continued)" }) => (
  <div style={{ fontSize: 10, color: "var(--pc-ink-4)", fontStyle: "italic", marginBottom: 8 }} className="pc-serif">{text}</div>
);

// Center canvas wrapper — paper sheets stacked
const EditorCanvas = ({ children, surface = "edit", showMarginGuides = false, banner = null }) => (
  <main style={{
    flex: 1, minWidth: 0, background: "var(--pc-bg)", overflow: "auto",
    display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 24px 40px",
    position: "relative",
  }} className="pc-dots">
    {banner}
    <div className="pc-paper" style={{ width: 600, minHeight: 820, padding: "32px 44px", position: "relative" }}>
      {showMarginGuides && (
        <>
          {/* Margin guide overlay */}
          <div style={{ position: "absolute", inset: "32px 44px", border: "1px dashed rgba(53,92,255,0.55)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "absolute", top: 32, left: 4, fontSize: 9, color: "var(--pc-primary)", letterSpacing: "0.04em" }}>15mm</div>
          <div style={{ position: "absolute", top: 4, left: 44, fontSize: 9, color: "var(--pc-primary)", letterSpacing: "0.04em" }}>18mm</div>
        </>
      )}
      {children}
    </div>
    {surface === "preview" && (
      <div style={{ marginTop: 12, fontSize: 11, color: "var(--pc-ink-4)" }}>Preview surface · clean, no editing chrome</div>
    )}
  </main>
);

// ───────────────────────────────────────────────────────────────────────────
// RIGHT PANEL — Official preview strip (miniature)
// ───────────────────────────────────────────────────────────────────────────

const OfficialPreviewStrip = () => (
  <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "16px 14px 22px", overflow: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
    <div>
      <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Official Preview</div>
      <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginTop: 2 }}>Scroll-synced · read-only</div>
    </div>

    {[1, 2, 3, 4].map(p => (
      <div key={p} style={{ position: "relative" }}>
        <div className="pc-paper" style={{
          width: "100%", aspectRatio: "1 / 1.414", borderRadius: 3, padding: "10px 12px",
          overflow: "hidden", fontSize: 4.5, lineHeight: 1.5,
        }}>
          <div style={{ textAlign: "center", borderBottom: "0.5px solid var(--pc-ink)", paddingBottom: 4 }}>
            <div className="pc-serif" style={{ fontSize: 6, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Saraswati Vidya Niketan</div>
            <div style={{ fontSize: 3.5, color: "var(--pc-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Senior Secondary · Lucknow</div>
            <div className="pc-serif" style={{ fontSize: 4.5, fontStyle: "italic", marginTop: 3 }}>Half-Yearly · 2025–26</div>
          </div>
          <div style={{ marginTop: 4 }}>
            {p === 1 && <>
              <div className="pc-serif" style={{ fontSize: 5, fontWeight: 500 }}>Section A · Compulsory</div>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ display: "flex", marginTop: 2, gap: 3 }}>
                  <span style={{ width: 6 }}>{i}.</span>
                  <span style={{ flex: 1, color: "var(--pc-ink-3)" }}>Question text continues on this line and wraps if longer than the column ...</span>
                  <span style={{ width: 6, textAlign: "right" }}>[{i < 2 ? 5 : 1}]</span>
                </div>
              ))}
            </>}
            {p === 2 && <>
              <div className="pc-serif" style={{ fontSize: 4, color: "var(--pc-ink-4)", fontStyle: "italic", marginBottom: 3 }}>Section B (continued)</div>
              {[7,8,9,10,11,12,13,14,15,16,17,18].map(i => (
                <div key={i} style={{ display: "flex", marginTop: 1.5, gap: 3 }}>
                  <span style={{ width: 7 }}>{i}.</span>
                  <span style={{ flex: 1, color: "var(--pc-ink-3)" }}>Question with options (a), (b), (c), (d) all in a 2-column grid below the prompt.</span>
                  <span style={{ width: 6, textAlign: "right" }}>[1]</span>
                </div>
              ))}
            </>}
            {(p === 3 || p === 4) && <>
              <div className="pc-serif" style={{ fontSize: 5, fontWeight: 500 }}>Section C · Long answer</div>
              {[19,20,21,22].map(i => (
                <div key={i} style={{ display: "flex", marginTop: 2.5, gap: 3 }}>
                  <span style={{ width: 7 }}>{i}.</span>
                  <span style={{ flex: 1, color: "var(--pc-ink-3)" }}>A long-form essay question that students should answer in 80 to 100 words with proper paragraphs and examples.</span>
                  <span style={{ width: 6, textAlign: "right" }}>[5]</span>
                </div>
              ))}
            </>}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, textAlign: "center", fontSize: 9, color: "var(--pc-ink-4)" }}>Page {p}</div>
      </div>
    ))}
  </aside>
);

// ───────────────────────────────────────────────────────────────────────────
// SHELL — sidebar + topbar + editor toolbar + 3 columns
// ───────────────────────────────────────────────────────────────────────────

const PEShell = ({ children, toolbarProps = {} }) => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="teacher" active="builder" items={TEACHER_NAV}
        footName="Rajesh Sharma" footRole="Teacher · Social Science" footAvatar="RS" footAvatarClass="is-amber" />
      <div className="pc-work">
        <Topbar
          crumbs={["Academic", "Paper Builder", "Examination Editor"]}
          actions={<button className="pc-btn"><Icon name="users" size={13} />Share</button>}
        />
        <PEToolbar {...toolbarProps} />
        {children}
      </div>
    </div>
  </div>
);

Object.assign(window, {
  PE_SECTIONS,
  PEToolbar, PEShell,
  StructureNavigator,
  DocumentInspector, QuestionInspector, SectionInspector,
  PrintHeader, PrintInstructions, PrintSectionHead, PrintQuestion,
  FloatingToolbar, PageBreak, ContinuationHeader,
  EditorCanvas, OfficialPreviewStrip,
  InsLabel, InsSectionTitle, FormatSlider, ToggleGroup, PresetCard, HeaderPresetSketch, FieldInput, Checkbox, InlineChip,
});
