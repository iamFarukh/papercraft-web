// Templates.jsx — Template workspace (4 screens)
//
// Architecture: Templates control VISUAL identity of printed papers. They
// are intentionally restrained — controlled theme tokens, not a free canvas
// editor. (Free-canvas == Canva territory == out of scope.)
//
// Flow:
//   ① Library  · Default + Custom templates, with mini paper previews
//   ② Editor   · Token-driven editor with live A4 preview
//   ③ Picker   · Apply template (sheet over Generate flow)
//   ④ Detail   · Custom template detail — usage, ownership, share controls

// ───────────────────────────────────────────────────────────────────────────
// Mock data
// ───────────────────────────────────────────────────────────────────────────

const TP_DEFAULTS = [
  { id: "t-classic",   name: "Academic Classic",     hint: "Centred crest, italic exam title, decorative rules. The sober Indian board look.",
    tokens: { font: "serif", header: "centered",  density: "comfortable", color: "#15161A", crest: true,  bilingual: false }, used: 224, flag: true },
  { id: "t-modern",    name: "Modern School",        hint: "Left-aligned masthead, larger serif title, denser meta strip. Magazine-like.",
    tokens: { font: "serif", header: "left",      density: "comfortable", color: "#2A47CC", crest: false, bilingual: false }, used: 86 },
  { id: "t-compact",   name: "Compact Examination",  hint: "Tighter line height, two-column meta. Saves a page on long papers.",
    tokens: { font: "sans",  header: "centered",  density: "compact",     color: "#15161A", crest: true,  bilingual: false }, used: 54 },
  { id: "t-formal",    name: "Formal Board Style",   hint: "All-caps masthead with school number. Mirrors CBSE board paper layout.",
    tokens: { font: "serif", header: "twocol",    density: "comfortable", color: "#15161A", crest: true,  bilingual: false }, used: 41 },
  { id: "t-minimal",   name: "Minimal Institutional", hint: "No crest, single rule, generous whitespace. For low-ink printing.",
    tokens: { font: "sans",  header: "centered",  density: "spacious",    color: "#51555E", crest: false, bilingual: false }, used: 18 },
  { id: "t-bilingual", name: "Bilingual · Hindi / English", hint: "Devanagari + Latin side-by-side. For RBSE and Hindi-medium schools.",
    tokens: { font: "serif", header: "centered",  density: "comfortable", color: "#15161A", crest: true,  bilingual: true }, used: 32 },
];

const TP_CUSTOM = [
  { id: "tc-svn",  name: "Saraswati · House Brand", hint: "School crest, deep saffron rule, watermark on every page.",
    tokens: { font: "serif", header: "centered", density: "comfortable", color: "#A23F0E", crest: true, bilingual: false }, used: 96, author: "Aarav Kapoor", updated: "08 Oct 2025" },
  { id: "tc-svnL", name: "Saraswati · Internal (low-ink)", hint: "Black & white, no watermark, compact for daily worksheets.",
    tokens: { font: "sans",  header: "left",     density: "compact",     color: "#15161A", crest: false, bilingual: false }, used: 41, author: "Priya Menon",   updated: "02 Oct 2025" },
];

// ───────────────────────────────────────────────────────────────────────────
// Shared shell
// ───────────────────────────────────────────────────────────────────────────

const TPShell = ({ children, crumbs, actions }) => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="templates" items={ADMIN_NAV}
        footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar crumbs={crumbs} actions={actions} />
        {children}
      </div>
    </div>
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
// Mini paper preview — the heart of the templates UI
// ───────────────────────────────────────────────────────────────────────────

const MiniPaper = ({ tokens, size = "card", schoolName = "Saraswati Vidya Niketan", title = "Half-Yearly Examination · 2025–26" }) => {
  const isCard = size === "card";
  const isLarge = size === "large";

  // Map density → spacing scale
  const density = tokens.density === "compact" ? 0.8 : tokens.density === "spacious" ? 1.25 : 1;
  const fontFamily = tokens.font === "serif" ? "var(--pc-serif)" : "var(--pc-sans)";

  // Scale based on size
  const scale = isCard ? 1 : isLarge ? 1.85 : 1.35;
  const baseW = 240;

  return (
    <div style={{
      width: baseW * scale, height: baseW * scale * 1.32,
      background: "var(--pc-paper)",
      border: "1px solid var(--pc-paper-edge)",
      boxShadow: isLarge ? "var(--pc-shadow-paper)" : "var(--pc-shadow-xs)",
      borderRadius: 2,
      position: "relative",
      overflow: "hidden",
      padding: 14 * scale,
      fontFamily,
      transform: isCard ? "translateZ(0)" : undefined,
    }}>
      {/* Header */}
      <div style={{
        textAlign: tokens.header === "left" ? "left" : "center",
        paddingBottom: 8 * scale,
        borderBottom: "1.2px solid " + tokens.color,
        display: tokens.header === "twocol" ? "flex" : "block",
        alignItems: tokens.header === "twocol" ? "center" : undefined,
        gap: tokens.header === "twocol" ? 10 : 0,
      }}>
        {tokens.crest && (
          <div style={{
            display: tokens.header === "left" ? "inline-flex" : tokens.header === "twocol" ? "inline-flex" : "flex",
            justifyContent: tokens.header === "left" ? "flex-start" : "center",
            marginBottom: tokens.header === "twocol" ? 0 : 3 * scale,
            marginRight: tokens.header === "left" ? 8 : 0,
            verticalAlign: "middle",
          }}>
            <svg viewBox="0 0 40 40" width={14 * scale} height={14 * scale}>
              <path d="M20 2 L34 8 L34 22 C34 30 28 36 20 38 C12 36 6 30 6 22 L6 8 Z" fill="none" stroke={tokens.color} strokeWidth="1.4"/>
              <text x="20" y="25" textAnchor="middle" fontFamily="Newsreader, serif" fontSize="14" fontStyle="italic" fill={tokens.color}>S</text>
            </svg>
          </div>
        )}
        <div style={{ flex: tokens.header === "twocol" ? 1 : undefined, textAlign: tokens.header === "left" ? "left" : "center" }}>
          {tokens.bilingual && (
            <div style={{ fontFamily: "Newsreader, serif", fontSize: 6.5 * scale, letterSpacing: "0.06em", color: tokens.color, opacity: 0.9 }}>सरस्वती विद्या निकेतन</div>
          )}
          <div style={{ fontFamily: "Newsreader, serif", fontWeight: 500, fontSize: 8 * scale, letterSpacing: "0.08em", textTransform: "uppercase", color: tokens.color, lineHeight: 1.2 }}>
            {schoolName}
          </div>
          <div style={{ fontFamily: "Newsreader, serif", fontSize: 5.5 * scale, fontStyle: "italic", color: tokens.color, opacity: 0.7, marginTop: 1 }}>
            {title}
          </div>
        </div>
      </div>

      {/* Meta strip */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: `${4 * scale}px ${2 * scale}px`, borderBottom: "0.4px solid " + tokens.color, marginTop: 1, fontFamily, fontSize: 5 * scale, color: tokens.color, opacity: 0.9 }}>
        <span>Class X</span><span>Math</span><span>3 hr</span><span>80m</span>
      </div>

      {/* Body — question lines */}
      <div style={{ marginTop: 7 * scale, display: "flex", flexDirection: "column", gap: 5 * scale * density }}>
        {[1, 2, 3].map(sec => (
          <div key={sec} style={{ display: "flex", flexDirection: "column", gap: 2.5 * scale * density }}>
            <div style={{ fontFamily: "Newsreader, serif", fontWeight: 500, fontSize: 6 * scale, color: tokens.color, marginBottom: 1 * scale }}>
              Section {String.fromCharCode(64 + sec)}
            </div>
            {[1, 2, 3, 4].map(q => (
              <div key={q} style={{ display: "flex", gap: 4 * scale, alignItems: "baseline" }}>
                <span style={{ fontSize: 4.5 * scale, fontFamily: "Newsreader, serif", color: tokens.color, width: 6 * scale, flexShrink: 0 }}>Q{q}.</span>
                <div style={{ flex: 1, height: 2.2 * scale, background: tokens.color, opacity: 0.18, borderRadius: 1, width: `${88 - q * 6}%` }} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Watermark */}
      {tokens.crest && size === "large" && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", opacity: 0.04 }}>
          <svg viewBox="0 0 40 40" width={baseW * scale * 0.55} height={baseW * scale * 0.55}>
            <path d="M20 2 L34 8 L34 22 C34 30 28 36 20 38 C12 36 6 30 6 22 L6 8 Z" fill={tokens.color}/>
          </svg>
        </div>
      )}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────
// Template card (library)
// ───────────────────────────────────────────────────────────────────────────

const TemplateCard = ({ t, type = "default" }) => {
  const isCustom = type === "custom";
  return (
    <div style={{
      background: "var(--pc-surface)",
      border: "1px solid var(--pc-line)",
      borderRadius: "var(--pc-r-lg)",
      boxShadow: "var(--pc-shadow-sm)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      cursor: "pointer",
      position: "relative",
    }}>
      {/* Preview area */}
      <div style={{ background: "var(--pc-bg)", borderBottom: "1px solid var(--pc-line)", padding: "20px 0", display: "grid", placeItems: "center" }} className="pc-dots">
        <MiniPaper tokens={t.tokens} size="card" />
        {t.flag && (
          <span className="pc-tag is-primary" style={{ position: "absolute", top: 12, right: 12, height: 18, fontSize: 10, zIndex: 2 }}>
            <Icon name="star" size={9} />Default
          </span>
        )}
      </div>

      {/* Meta */}
      <div style={{ padding: "12px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: t.tokens.color, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "var(--pc-shadow-xs)" }} />
          <div className="pc-serif" style={{ fontSize: 14, fontWeight: 500, color: "var(--pc-ink)", letterSpacing: "-0.012em" }}>{t.name}</div>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", marginTop: 4, lineHeight: 1.4, minHeight: 32 }}>{t.hint}</div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--pc-line)", gap: 6 }}>
          <span className="pc-tag is-outline" style={{ height: 17, fontSize: 9.5 }}>{t.tokens.font === "serif" ? "Serif" : "Sans"}</span>
          <span className="pc-tag is-outline" style={{ height: 17, fontSize: 9.5 }}>{t.tokens.density}</span>
          {t.tokens.bilingual && <span className="pc-tag is-outline" style={{ height: 17, fontSize: 9.5 }}>Bilingual</span>}
          <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)" }}>
            {isCustom ? `${t.author} · ${t.updated}` : <>Used <span className="pc-num" style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{t.used}</span></>}
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ① Template Library
// ═══════════════════════════════════════════════════════════════════════════

const TPLibrary = () => (
  <TPShell
    crumbs={["Papers", "Templates"]}
    actions={
      <>
        <button className="pc-btn"><Icon name="upload" size={13} />Import</button>
        <button className="pc-btn is-primary"><Icon name="plus" size={13} />New template</button>
      </>
    }
  >
    <main className="pc-scroll" style={{ padding: "26px 28px 40px", flex: 1, minHeight: 0 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Templates</div>
          <h2 className="pc-serif" style={{ fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: "-0.022em", color: "var(--pc-ink)" }}>Visual identity for every paper</h2>
          <div style={{ fontSize: 12.5, color: "var(--pc-ink-3)", marginTop: 4 }}>
            Templates change how a paper <em>looks</em>. Pick a default, or compose your school's own brand from controlled tokens — logo, color, typography, density, watermark. Academic structure stays in <a href="#" style={{ color: "var(--pc-primary)", textDecoration: "none" }}>Blueprints</a>.
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button className="pc-btn is-sm"><Icon name="filter" size={11} />All formats</button>
          <span style={{ width: 1, height: 22, background: "var(--pc-line)", margin: "0 4px" }} />
          <button className="pc-btn is-sm is-ghost" style={{ background: "var(--pc-surface-3)" }}><Icon name="grid" size={11} /></button>
          <button className="pc-btn is-sm is-ghost"><Icon name="list" size={11} /></button>
        </div>
      </div>

      {/* Editorial note */}
      <div className="pc-callout" style={{ marginBottom: 22, paddingTop: 8, paddingBottom: 8 }}>
        <div className="pc-serif" style={{ fontStyle: "italic", fontSize: 13.5, color: "var(--pc-ink-2)", letterSpacing: "-0.005em" }}>
          PaperCraft templates are restrained on purpose. Academic software should feel trustworthy — not overdesigned.
        </div>
      </div>

      {/* Default templates */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 14px" }}>
        <h3 className="pc-serif" style={{ fontSize: 17, fontWeight: 500, margin: 0, letterSpacing: "-0.018em" }}>Default · provided by PaperCraft</h3>
        <span className="pc-tag is-outline" style={{ height: 18, fontSize: 10 }}>Restrained · trustworthy</span>
        <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
        <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{TP_DEFAULTS.length} templates</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {TP_DEFAULTS.map(t => <TemplateCard key={t.id} t={t} />)}
      </div>

      {/* Custom */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 14px" }}>
        <h3 className="pc-serif" style={{ fontSize: 17, fontWeight: 500, margin: 0, letterSpacing: "-0.018em" }}>Custom · Saraswati Vidya Niketan</h3>
        <span className="pc-tag is-primary" style={{ height: 18, fontSize: 10 }}>School-specific</span>
        <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
        <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{TP_CUSTOM.length} templates · school branding active</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {TP_CUSTOM.map(t => <TemplateCard key={t.id} t={t} type="custom" />)}
        {/* New CTA */}
        <div style={{ background: "transparent", border: "1.5px dashed var(--pc-line-2)", borderRadius: "var(--pc-r-lg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 22px", cursor: "pointer", color: "var(--pc-ink-4)", minHeight: 360 }}>
          <span style={{ width: 44, height: 44, borderRadius: 11, background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", display: "grid", placeItems: "center", marginBottom: 12 }}>
            <Icon name="plus" size={18} />
          </span>
          <div className="pc-serif" style={{ fontSize: 14, fontWeight: 500, color: "var(--pc-ink-2)", letterSpacing: "-0.012em" }}>Create a school template</div>
          <div style={{ fontSize: 11.5, marginTop: 4, textAlign: "center", maxWidth: 200, lineHeight: 1.5 }}>Logo, color, header style, font, density, watermark — token-driven, takes ~5 minutes.</div>
          <button className="pc-btn is-sm" style={{ marginTop: 14 }}><Icon name="palette" size={11} />Start from blank</button>
        </div>
      </div>
    </main>
  </TPShell>
);

// ═══════════════════════════════════════════════════════════════════════════
// ② Template Editor
// ═══════════════════════════════════════════════════════════════════════════

const ControlGroup = ({ label, hint, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 6 }}>{label}</div>
    {hint && <div style={{ fontSize: 11, color: "var(--pc-ink-4)", marginBottom: 8, lineHeight: 1.4 }}>{hint}</div>}
    {children}
  </div>
);

const SegRadio = ({ options, value }) => (
  <div style={{ display: "inline-flex", background: "var(--pc-surface-3)", borderRadius: 8, padding: 2, gap: 0 }}>
    {options.map(o => (
      <button key={o.v} style={{
        height: 28, padding: "0 12px",
        background: value === o.v ? "var(--pc-surface)" : "transparent",
        border: 0, borderRadius: 6,
        boxShadow: value === o.v ? "var(--pc-shadow-xs)" : "none",
        color: value === o.v ? "var(--pc-ink)" : "var(--pc-ink-3)",
        fontFamily: "var(--pc-sans)", fontSize: 11.5, fontWeight: 500, cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 5,
      }}>
        {o.icon && <Icon name={o.icon} size={11} />}
        {o.label}
      </button>
    ))}
  </div>
);

const ColorSwatch = ({ color, sel }) => (
  <button style={{
    width: 32, height: 32, borderRadius: 8,
    background: color,
    border: sel ? "2px solid white" : "1px solid rgba(0,0,0,0.08)",
    boxShadow: sel ? "0 0 0 2px var(--pc-primary), var(--pc-shadow-xs)" : "var(--pc-shadow-xs)",
    cursor: "pointer", padding: 0,
  }} />
);

const TPEditor = () => {
  // Current tokens (mock state)
  const tokens = { font: "serif", header: "centered", density: "comfortable", color: "#A23F0E", crest: true, bilingual: false };

  return (
    <TPShell
      crumbs={["Papers", "Templates", "Saraswati · House Brand"]}
      actions={
        <>
          <button className="pc-btn"><Icon name="history" size={13} />Revisions</button>
          <button className="pc-btn"><Icon name="eye" size={13} />Preview full</button>
          <button className="pc-btn is-primary"><Icon name="check" size={13} />Save template</button>
        </>
      }
    >
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "360px 1fr 320px" }}>

        {/* LEFT · controls */}
        <aside style={{ borderRight: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", overflow: "auto" }} className="pc-scroll">
          <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid var(--pc-line)" }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Editing template</div>
            <input defaultValue="Saraswati · House Brand" style={{ width: "100%", padding: "4px 0", border: 0, background: "transparent", fontFamily: "var(--pc-serif)", fontSize: 18, fontWeight: 500, letterSpacing: "-0.018em", color: "var(--pc-ink)", outline: "none", marginTop: 2 }} />
            <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>v3 · saved 12s ago</div>
          </div>

          <div style={{ padding: "18px 22px" }}>
            <ControlGroup label="School identity">
              <Field label="School name" value="Saraswati Vidya Niketan" />
              <div style={{ height: 10 }} />
              <Field label="Sub-title"  value="Senior Secondary · Estd. 1962 · Lucknow" />
              <div style={{ height: 10 }} />
              <div>
                <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Crest / logo</span>
                <div style={{ marginTop: 6, padding: "12px 14px", background: "var(--pc-surface)", border: "1px dashed var(--pc-line-2)", borderRadius: 9, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 44, height: 44, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", borderRadius: 7, display: "grid", placeItems: "center" }}>
                    <svg viewBox="0 0 40 40" width="28" height="28">
                      <path d="M20 2 L34 8 L34 22 C34 30 28 36 20 38 C12 36 6 30 6 22 L6 8 Z" fill="none" stroke="#A23F0E" strokeWidth="1.4"/>
                      <text x="20" y="25" textAnchor="middle" fontFamily="Newsreader, serif" fontSize="14" fontStyle="italic" fill="#A23F0E">S</text>
                    </svg>
                  </div>
                  <div style={{ flex: 1, lineHeight: 1.3 }}>
                    <div style={{ fontSize: 12, color: "var(--pc-ink)", fontWeight: 500 }}>school-crest.svg</div>
                    <div style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>SVG · 4.2 KB</div>
                  </div>
                  <button className="pc-btn is-sm"><Icon name="refresh" size={11} />Replace</button>
                </div>
              </div>
            </ControlGroup>

            <ControlGroup label="Brand color" hint="Used for rules, headings, and the watermark tint. Pick from the school palette.">
              <div style={{ display: "flex", gap: 8 }}>
                {["#15161A", "#2A47CC", "#0E7A52", "#A23F0E", "#5E3FA2", "#9A5C0F"].map((c, i) => (
                  <ColorSwatch key={c} color={c} sel={i === 3} />
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Typography">
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", marginBottom: 5, display: "block" }}>Body family</span>
                <SegRadio value="serif" options={[{ v: "serif", label: "Serif" }, { v: "sans", label: "Sans" }, { v: "mixed", label: "Mixed" }]} />
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", marginBottom: 5, display: "block" }}>Base size</span>
                <SegRadio value="m" options={[{ v: "s", label: "S · 10pt" }, { v: "m", label: "M · 11pt" }, { v: "l", label: "L · 12pt" }]} />
              </div>
            </ControlGroup>

            <ControlGroup label="Header style">
              <SegRadio value="centered" options={[
                { v: "centered", label: "Centred" },
                { v: "left", label: "Left" },
                { v: "twocol", label: "Two-col" },
              ]} />
            </ControlGroup>

            <ControlGroup label="Density" hint="Affects line height, section spacing, and questions-per-page.">
              <SegRadio value="comfortable" options={[
                { v: "compact", label: "Compact" },
                { v: "comfortable", label: "Comfortable" },
                { v: "spacious", label: "Spacious" },
              ]} />
            </ControlGroup>

            <ControlGroup label="Page chrome">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Watermark crest", true,  "School crest at 4% opacity behind questions."],
                  ["Bilingual header", false, "Devanagari + Latin school name in header."],
                  ["Page numbers",    true,  "Bottom-right of each page · 'X of Y' format."],
                  ["Footer text",     true,  "Half-Yearly · 2025–26"],
                ].map(([k, on, hint]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 26, height: 16, background: on ? "var(--pc-primary)" : "var(--pc-surface-3)", borderRadius: 999, padding: 1.5, flexShrink: 0 }}>
                      <span style={{ width: 13, height: 13, background: "white", borderRadius: 999, display: "block", transform: on ? "translateX(10px)" : "translateX(0)", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
                    </span>
                    <div style={{ flex: 1, lineHeight: 1.25 }}>
                      <div style={{ fontSize: 12, color: "var(--pc-ink)", fontWeight: 500 }}>{k}</div>
                      <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Decorative rules" hint="Hairlines under header & between sections.">
              <SegRadio value="single" options={[
                { v: "none", label: "None" },
                { v: "single", label: "Single" },
                { v: "double", label: "Double" },
              ]} />
            </ControlGroup>
          </div>
        </aside>

        {/* CENTER · live preview */}
        <main style={{ background: "var(--pc-bg)", overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 24px 40px" }} className="pc-dots pc-scroll">
          {/* preview toolbar */}
          <div className="pc-float" style={{ padding: "6px 8px", marginBottom: 18, display: "flex", alignItems: "center", gap: 4 }}>
            <button className="pc-btn is-sm is-ghost"><Icon name="minus" size={11} /></button>
            <span className="pc-num" style={{ fontSize: 11.5, padding: "0 6px", color: "var(--pc-ink-3)" }}>100%</span>
            <button className="pc-btn is-sm is-ghost"><Icon name="plus" size={11} /></button>
            <span style={{ width: 1, height: 18, background: "var(--pc-line)", margin: "0 4px" }} />
            <SegRadio value="paper" options={[{ v: "paper", label: "Paper" }, { v: "thumb", label: "Thumb" }]} />
            <span style={{ width: 1, height: 18, background: "var(--pc-line)", margin: "0 4px" }} />
            <span className="pc-tag is-success" style={{ height: 20 }}><Icon name="check" size={9} />Live</span>
          </div>

          <MiniPaper tokens={tokens} size="large" />

          <div style={{ marginTop: 16, fontSize: 11, color: "var(--pc-ink-4)", textAlign: "center", maxWidth: 480, lineHeight: 1.5 }}>
            Showing the front page of a sample Half-Yearly paper with this template. Switch to <strong style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>Thumb</strong> view to see how it looks at PDF thumbnail size.
          </div>
        </main>

        {/* RIGHT · token inspector + metadata */}
        <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "20px 20px 22px", overflow: "auto", display: "flex", flexDirection: "column", gap: 18 }} className="pc-scroll">
          <div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Theme tokens</div>
            <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)", fontFamily: "var(--pc-mono)", fontSize: 11, lineHeight: 1.7 }}>
              <div><span style={{ color: "var(--pc-ink-4)" }}>{"{"}</span></div>
              <div style={{ paddingLeft: 12 }}><span style={{ color: "var(--pc-ink-3)" }}>"font"</span>: <span style={{ color: "#A23F0E" }}>"serif"</span>,</div>
              <div style={{ paddingLeft: 12 }}><span style={{ color: "var(--pc-ink-3)" }}>"header"</span>: <span style={{ color: "#A23F0E" }}>"centered"</span>,</div>
              <div style={{ paddingLeft: 12 }}><span style={{ color: "var(--pc-ink-3)" }}>"density"</span>: <span style={{ color: "#A23F0E" }}>"comfortable"</span>,</div>
              <div style={{ paddingLeft: 12 }}><span style={{ color: "var(--pc-ink-3)" }}>"primaryColor"</span>: <span style={{ color: "#A23F0E" }}>"#A23F0E"</span>,</div>
              <div style={{ paddingLeft: 12 }}><span style={{ color: "var(--pc-ink-3)" }}>"watermark"</span>: <span style={{ color: "var(--pc-primary)" }}>true</span>,</div>
              <div style={{ paddingLeft: 12 }}><span style={{ color: "var(--pc-ink-3)" }}>"pageNumbers"</span>: <span style={{ color: "var(--pc-primary)" }}>true</span></div>
              <div><span style={{ color: "var(--pc-ink-4)" }}>{"}"}</span></div>
            </div>
          </div>

          <div className="pc-callout">
            <div className="pc-serif" style={{ fontStyle: "italic", fontSize: 12.5, color: "var(--pc-ink-2)", lineHeight: 1.5 }}>
              Templates are token sets, not free canvases. Anything outside this panel is intentionally out of scope — schools need a trustworthy paper, not a Canva.
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Where it's used</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Half-Yearly · X · Maths",  "96 papers"],
                ["Pre-Board · X · Maths",     "28 papers"],
                ["Weekly Assessment · VIII",  "12 papers"],
              ].map(([k, n]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", padding: "8px 10px", background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 8 }}>
                  <Icon name="target" size={12} style={{ color: "var(--pc-ink-4)", marginRight: 8 }} />
                  <span style={{ fontSize: 12, color: "var(--pc-ink)" }}>{k}</span>
                  <span className="pc-num" style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--pc-ink-4)" }}>{n}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Audit</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11.5 }}>
              <div style={{ display: "flex" }}><span style={{ color: "var(--pc-ink-4)" }}>Created</span><span style={{ marginLeft: "auto", color: "var(--pc-ink-2)" }}>Aarav Kapoor · 12 Aug 2025</span></div>
              <div style={{ display: "flex" }}><span style={{ color: "var(--pc-ink-4)" }}>Last edited</span><span style={{ marginLeft: "auto", color: "var(--pc-ink-2)" }}>Priya Menon · 8 Oct 2025</span></div>
              <div style={{ display: "flex" }}><span style={{ color: "var(--pc-ink-4)" }}>Visibility</span><span style={{ marginLeft: "auto", color: "var(--pc-ink-2)" }}>All Maths teachers</span></div>
            </div>
          </div>
        </aside>
      </div>
    </TPShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ③ Template Picker (sheet over Generate flow)
// ═══════════════════════════════════════════════════════════════════════════

const TPPicker = () => {
  // Mock background context — the Generate flow paused mid-step
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Background — dimmed generate flow */}
      <div className="pc-screen" style={{ filter: "blur(0px) brightness(0.92)" }}>
        <div className="pc-shell">
          <Sidebar role="teacher" active="gen" items={TEACHER_NAV}
            footName="Rohit Banerjee" footRole="Math · Class X-B" footAvatar="RB" footAvatarClass="is-teal" />
          <div className="pc-work">
            <Topbar crumbs={["Compose", "Generate Paper", "Step 3 · Template"]} />
            <div style={{ flex: 1, minHeight: 0, padding: "40px", background: "var(--pc-bg)" }} className="pc-dots">
              <div className="pc-panel pc-panel-pad" style={{ maxWidth: 760, margin: "0 auto", opacity: 0.45 }}>
                <h3 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Step 3 of 4 · Pick a template</h3>
                <div style={{ fontSize: 12.5, color: "var(--pc-ink-3)", marginTop: 4 }}>How should your paper look? You can change it later.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(20,22,26,0.42)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", display: "grid", placeItems: "center", zIndex: 20 }}>
        <div style={{
          width: 1180, maxHeight: 880,
          background: "var(--pc-surface)", borderRadius: 18,
          border: "1px solid var(--pc-line)", boxShadow: "var(--pc-shadow-lg)",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{ padding: "20px 26px", borderBottom: "1px solid var(--pc-line)", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--pc-paper)", border: "1px solid var(--pc-paper-edge)", display: "grid", placeItems: "center" }}>
              <Icon name="palette" size={16} style={{ color: "var(--pc-ink-3)" }} />
            </span>
            <div style={{ flex: 1 }}>
              <h3 className="pc-serif" style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: "-0.018em" }}>Pick a template</h3>
              <div style={{ fontSize: 12.5, color: "var(--pc-ink-3)" }}>Half-Yearly · Class X · Mathematics · 80 marks</div>
            </div>
            <span className="pc-tag is-outline" style={{ height: 22 }}><Icon name="info" size={10} />Visual only — academic structure stays the same.</span>
            <button className="pc-btn is-sm is-ghost" style={{ padding: "0 8px" }}>✕</button>
          </div>

          {/* Body — split picker / preview */}
          <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 420px" }}>
            {/* LEFT · template list */}
            <div className="pc-scroll" style={{ overflow: "auto", padding: "16px 22px 22px", borderRight: "1px solid var(--pc-line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Default templates</span>
                <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
                <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{TP_DEFAULTS.length}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
                {TP_DEFAULTS.slice(0, 6).map((t, i) => (
                  <div key={t.id} style={{
                    background: i === 0 ? "var(--pc-primary-50)" : "var(--pc-surface)",
                    border: "1.5px solid " + (i === 0 ? "var(--pc-primary)" : "var(--pc-line)"),
                    borderRadius: 12, padding: 10,
                    cursor: "pointer", position: "relative",
                    boxShadow: i === 0 ? "0 0 0 3px rgba(53,92,255,0.12)" : "var(--pc-shadow-xs)",
                  }}>
                    {i === 0 && <span className="pc-tag is-primary" style={{ position: "absolute", top: 8, right: 8, height: 18, fontSize: 10 }}>Selected</span>}
                    <div style={{ background: "var(--pc-bg)", borderRadius: 6, padding: "10px 0", display: "grid", placeItems: "center", marginBottom: 8 }}>
                      <div style={{ transform: "scale(0.7)", transformOrigin: "center" }}><MiniPaper tokens={t.tokens} /></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: t.tokens.color, border: "1px solid rgba(0,0,0,0.08)" }} />
                      <div className="pc-serif" style={{ fontSize: 12.5, fontWeight: 500, letterSpacing: "-0.008em", color: "var(--pc-ink)" }}>{t.name}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Saraswati custom</span>
                <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
                <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)" }}>{TP_CUSTOM.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {TP_CUSTOM.map(t => (
                  <div key={t.id} style={{ background: "var(--pc-surface)", border: "1.5px solid var(--pc-line)", borderRadius: 12, padding: 10, cursor: "pointer", boxShadow: "var(--pc-shadow-xs)" }}>
                    <div style={{ background: "var(--pc-bg)", borderRadius: 6, padding: "10px 0", display: "grid", placeItems: "center", marginBottom: 8 }}>
                      <div style={{ transform: "scale(0.7)", transformOrigin: "center" }}><MiniPaper tokens={t.tokens} /></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: t.tokens.color, border: "1px solid rgba(0,0,0,0.08)" }} />
                      <div className="pc-serif" style={{ fontSize: 12.5, fontWeight: 500, letterSpacing: "-0.008em", color: "var(--pc-ink)" }}>{t.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT · large preview */}
            <div style={{ background: "var(--pc-bg)", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }} className="pc-dots">
              <div style={{ alignSelf: "stretch", display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Preview</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--pc-ink-3)" }}>Academic Classic · with your paper data</span>
              </div>
              <MiniPaper tokens={TP_DEFAULTS[0].tokens} size="med" />
              <div className="pc-callout" style={{ alignSelf: "stretch", fontSize: 11.5, color: "var(--pc-ink-3)" }}>
                <span className="pc-serif" style={{ fontStyle: "italic" }}>This is how your paper will print. Change template any time before submitting.</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "14px 22px", borderTop: "1px solid var(--pc-line)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>Templates only change visuals. Your blueprint, questions, and marks are unaffected.</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="pc-btn">Cancel</button>
              <button className="pc-btn is-primary"><Icon name="check" size={13} />Use Academic Classic</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ④ Custom Template Detail
// ═══════════════════════════════════════════════════════════════════════════

const TPDetail = () => {
  const t = TP_CUSTOM[0];

  return (
    <TPShell
      crumbs={["Papers", "Templates", "Saraswati · House Brand"]}
      actions={
        <>
          <button className="pc-btn"><Icon name="paperclip" size={13} />Duplicate</button>
          <button className="pc-btn"><Icon name="users" size={13} />Share</button>
          <button className="pc-btn is-primary"><Icon name="edit" size={13} />Edit template</button>
        </>
      }
    >
      <main className="pc-scroll" style={{ padding: "26px 28px 40px", flex: 1, minHeight: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: 28 }}>

          {/* Left · paper preview */}
          <div style={{ position: "sticky", top: 0, height: "fit-content", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--pc-bg)", border: "1px solid var(--pc-line)", borderRadius: 14, padding: "26px", display: "grid", placeItems: "center" }} className="pc-dots">
              <MiniPaper tokens={t.tokens} size="med" />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="pc-btn is-sm" style={{ flex: 1, justifyContent: "center" }}><Icon name="download" size={11} />Export tokens (JSON)</button>
              <button className="pc-btn is-sm" style={{ flex: 1, justifyContent: "center" }}><Icon name="eye" size={11} />Full preview</button>
            </div>
          </div>

          {/* Right · details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Header */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className="pc-tag is-primary" style={{ height: 20 }}>Custom · School template</span>
                <span className="pc-tag is-outline" style={{ height: 20 }}>v3 · current</span>
                <span className="pc-tag" style={{ height: 20 }}>Published</span>
              </div>
              <h1 className="pc-serif" style={{ fontSize: 28, fontWeight: 500, margin: "0 0 4px", letterSpacing: "-0.024em" }}>{t.name}</h1>
              <p className="pc-serif" style={{ fontSize: 14, fontStyle: "italic", color: "var(--pc-ink-3)", margin: 0, lineHeight: 1.5, maxWidth: 600 }}>
                {t.hint} Used as the default template for all formal examinations at Saraswati Vidya Niketan.
              </p>
              <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, auto) 1fr", gap: 30 }}>
                <Stat label="Papers using" value="96" hint="across 14 blueprints" />
                <Stat label="Last edit" value="08 Oct" hint="Priya Menon" />
                <Stat label="Version" value="v3" hint="2 prior revisions" />
                <Stat label="Visibility" value="All teachers" hint="Maths · Science · English" />
              </div>
            </div>

            {/* Token summary */}
            <div className="pc-panel" style={{ padding: "18px 22px" }}>
              <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 12 }}>Theme tokens</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 12 }}>
                {[
                  ["Body family", "Newsreader serif",   <span style={{ fontFamily: "var(--pc-serif)", fontSize: 17 }}>Aa</span>],
                  ["Header style", "Centred · with crest", <span className="pc-serif" style={{ fontSize: 12 }}>≡̈</span>],
                  ["Density",     "Comfortable · 11pt",  <span className="pc-mono" style={{ fontSize: 12 }}>1.5</span>],
                  ["Primary color", t.tokens.color,      <span style={{ width: 16, height: 16, borderRadius: 4, background: t.tokens.color, display: "inline-block", border: "1px solid rgba(0,0,0,0.08)" }} />],
                  ["Watermark",   "School crest · 4%",   <span style={{ fontSize: 11, color: "var(--pc-success)" }}><Icon name="check" size={12} /></span>],
                  ["Bilingual",   "English-only",        <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>—</span>],
                ].map(([k, v, vis]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 9 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 7, background: "var(--pc-surface)", border: "1px solid var(--pc-line)", display: "grid", placeItems: "center", color: "var(--pc-ink-3)" }}>{vis}</span>
                    <div style={{ lineHeight: 1.25 }}>
                      <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>{k}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)", marginTop: 1 }}>{v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage */}
            <div className="pc-panel" style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Where it's used</div>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--pc-ink-4)" }}>9 active blueprints</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["Half-Yearly · X · Maths",  "96 papers", "var(--pc-primary)"],
                  ["Pre-Board · X · Maths",     "28 papers", "var(--pc-primary)"],
                  ["Annual · XII · Physics",    "14 papers", "var(--pc-success)"],
                  ["Unit Test · IX · English",  "12 papers", "var(--pc-warning)"],
                  ["Periodic · VIII · Sci.",    "10 papers", "var(--pc-warning)"],
                  ["Olympiad Practice",         "6 papers",  "var(--pc-ink-2)"],
                ].map(([k, n, c]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", padding: "10px 12px", background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: c, marginRight: 9 }} />
                    <span className="pc-serif" style={{ fontSize: 13, color: "var(--pc-ink)" }}>{k}</span>
                    <span className="pc-num" style={{ marginLeft: "auto", fontSize: 11, color: "var(--pc-ink-4)" }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Versions */}
            <div className="pc-panel" style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Revision history</div>
                <button className="pc-btn is-sm is-ghost" style={{ marginLeft: "auto" }}><Icon name="history" size={11} />Restore previous</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  ["v3", "Primary color tightened to saffron 600", "Priya Menon", "08 Oct 2025", true],
                  ["v2", "Added page numbers · watermark opacity 4%", "Aarav Kapoor", "14 Sep 2025", false],
                  ["v1", "Initial template · forked from Academic Classic", "Aarav Kapoor", "12 Aug 2025", false],
                ].map(([v, msg, who, when, current]) => (
                  <div key={v} style={{ display: "grid", gridTemplateColumns: "44px 1fr auto auto", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px dashed var(--pc-line)" }}>
                    <span className="pc-mono" style={{ fontSize: 11, color: "var(--pc-ink-3)", padding: "2px 6px", background: current ? "var(--pc-primary-50)" : "var(--pc-surface-3)", borderRadius: 4, textAlign: "center", color: current ? "var(--pc-primary-ink)" : "var(--pc-ink-3)" }}>{v}</span>
                    <span className="pc-serif" style={{ fontSize: 13, color: "var(--pc-ink)" }}>{msg}</span>
                    <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>by {who}</span>
                    <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }} className="pc-num">{when}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </TPShell>
  );
};

// ───────────────────────────────────────────────────────────────────────────
Object.assign(window, { TPLibrary, TPEditor, TPPicker, TPDetail });
