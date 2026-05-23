// BulkUpload.jsx — Bulk CSV / XLSX Import flow (5 screens)
//
// Story: An RBSE school is migrating their Class VI–VIII Mathematics question
// bank. They drop in a 99-row CSV. We auto-map columns, validate every row,
// catch 12 warnings + 3 failures, prompt to create one new chapter, and
// import 84 questions — all as DRAFT (never auto-published).
//
// Flow:
//   ① Upload     · drop zone + template download + import rules
//   ② Map        · CSV columns → PaperCraft fields, with auto-detect
//   ③ Validate   · row-by-row preview, valid / warning / failed
//   ④ Summary    · pre-commit confirmation, new curriculum entries, draft-only
//   ⑤ Complete   · success + link to drafts + retry-failed download

const CSV_STEPS = [
  { key: "upload",   label: "Upload" },
  { key: "map",      label: "Map columns" },
  { key: "validate", label: "Validate" },
  { key: "summary",  label: "Summary" },
  { key: "done",     label: "Complete" },
];

const CsvStepper = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, fontSize: 12 }}>
    {CSV_STEPS.map((s, i) => {
      const idx = CSV_STEPS.findIndex(x => x.key === current);
      const isCur = s.key === current;
      const isDone = i < idx;
      return (
        <React.Fragment key={s.key}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "5px 11px 5px 7px",
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
          {i < CSV_STEPS.length - 1 && (
            <span style={{ width: 18, height: 1, margin: "0 2px",
              background: i < idx ? "var(--pc-ink-4)" : "var(--pc-line-2)" }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// Shared wizard chrome for the CSV flow
const CsvWizard = ({ step, fileName, fileMeta, footer, children }) => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="repo" items={ADMIN_NAV}
        footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar
          crumbs={["Academic", "Question Repository", "Bulk Import"]}
          actions={<button className="pc-btn is-sm is-ghost"><Icon name="arrowLeft" size={13} />Cancel import</button>}
        />

        {/* Stepper bar */}
        <div style={{ padding: "14px 28px", background: "var(--pc-bg)", borderBottom: "1px solid var(--pc-line)", display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg, #14B87A, #0E9560)", color: "white", display: "grid", placeItems: "center", boxShadow: "0 4px 10px -2px rgba(20,184,122,0.45)" }}>
              <Icon name="upload" size={14} />
            </span>
            <div style={{ lineHeight: 1.2 }}>
              <div className="pc-serif" style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.018em" }}>
                Bulk Import {fileName && <>· <span style={{ color: "var(--pc-ink-3)", fontStyle: "italic", fontWeight: 400 }}>{fileName}</span></>}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>
                {fileMeta || "Migrate question banks safely. Imported rows arrive as Draft for review."}
              </div>
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}><CsvStepper current={step} /></div>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "var(--pc-bg)" }}>
          {children}
        </div>

        {footer}
      </div>
    </div>
  </div>
);

const CsvFooter = ({ left, right }) => (
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
// ① UPLOAD — Drop zone + template download + instructions
// ═══════════════════════════════════════════════════════════════════════════

const CsvUpload = () => (
  <CsvWizard step="upload"
    footer={<CsvFooter
      left={<span style={{ fontSize: 12, color: "var(--pc-ink-3)" }}>
        <Icon name="lock" size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />
        Imports never auto-publish. All rows arrive as <strong style={{ color: "var(--pc-ink)", fontWeight: 500 }}>Draft</strong> for admin review.
      </span>}
      right={<>
        <button className="pc-btn">Cancel</button>
        <button className="pc-btn is-primary" disabled style={{ opacity: 0.55, cursor: "not-allowed" }}>
          Next · Map columns<Icon name="arrowRight" size={13} />
        </button>
      </>}
    />}
  >
    <div className="pc-scroll" style={{ overflow: "auto", padding: "32px 36px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, maxWidth: 1240, margin: "0 auto", width: "100%" }}>
      {/* LEFT — Drop zone + template */}
      <div>
        {/* Drop zone */}
        <div style={{
          position: "relative",
          background: "var(--pc-surface)",
          border: "1.5px dashed var(--pc-primary)",
          borderRadius: 16, padding: "44px 32px",
          textAlign: "center",
          backgroundImage: "linear-gradient(180deg, rgba(53,92,255,0.04), rgba(53,92,255,0))",
          boxShadow: "var(--pc-shadow-xs)",
        }}>
          {/* Decorative file icon stack */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, position: "relative", height: 76 }}>
            {[
              { rot: -8, x: -28, op: 0.5, c: "#F5F4EE", b: "#E8E5DD", label: "csv" },
              { rot: 6,  x: 28,  op: 0.7, c: "#FAFAF7", b: "#D9D5C9", label: "xlsx" },
              { rot: 0,  x: 0,   op: 1,   c: "#FFFFFF", b: "#355CFF", label: "csv", strong: true },
            ].map((f, i) => (
              <div key={i} style={{
                position: "absolute", left: "50%", top: 0,
                transform: `translateX(-50%) translateX(${f.x}px) rotate(${f.rot}deg)`,
                width: 60, height: 76, borderRadius: 8,
                background: f.c, border: "1px solid " + f.b,
                boxShadow: f.strong ? "0 8px 24px -8px rgba(53,92,255,0.45), var(--pc-shadow-sm)" : "var(--pc-shadow-xs)",
                opacity: f.op,
                display: "flex", flexDirection: "column",
                fontFamily: "var(--pc-mono)", fontSize: 9,
              }}>
                <div style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                  {[1, 0.7, 0.85, 0.6, 0.75].map((w, j) => (
                    <span key={j} style={{ height: 2, width: `${w * 100}%`, background: "var(--pc-line-2)", borderRadius: 1 }} />
                  ))}
                </div>
                <div style={{
                  height: 14, background: f.strong ? "var(--pc-primary)" : "var(--pc-ink-4)",
                  color: "white", display: "grid", placeItems: "center",
                  fontSize: 8, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase",
                  borderRadius: "0 0 7px 7px",
                }}>{f.label}</div>
              </div>
            ))}
          </div>

          <h2 className="pc-serif" style={{ fontSize: 24, fontWeight: 500, margin: 0, letterSpacing: "-0.022em", color: "var(--pc-ink)" }}>
            Drop your question bank here
          </h2>
          <p style={{ fontSize: 13, color: "var(--pc-ink-3)", margin: "6px auto 18px", maxWidth: 460, lineHeight: 1.55 }}>
            We'll parse the file, map columns to PaperCraft fields, and validate every row before anything is written. You stay in control.
          </p>

          <div style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
            <button className="pc-btn is-primary is-lg"><Icon name="folder" size={15} />Browse files</button>
            <span style={{ fontSize: 12, color: "var(--pc-ink-4)" }}>or drop here</span>
          </div>

          <div style={{ marginTop: 22, display: "inline-flex", gap: 14, alignItems: "center", padding: "8px 14px", background: "var(--pc-surface-3)", borderRadius: 999, fontSize: 11.5, color: "var(--pc-ink-3)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span className="pc-tag is-outline" style={{ height: 18, fontSize: 10 }}>.csv</span>
              <span className="pc-tag is-outline" style={{ height: 18, fontSize: 10 }}>.xlsx</span>
            </span>
            <span style={{ width: 1, height: 12, background: "var(--pc-line)" }} />
            <span>Up to 5,000 rows</span>
            <span style={{ width: 1, height: 12, background: "var(--pc-line)" }} />
            <span>UTF-8 · Devanagari supported</span>
          </div>
        </div>

        {/* Template download */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>
            New to bulk import?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { ext: "CSV", color: "#2E7D5F", desc: "Lightweight · open in any editor", size: "4 KB", count: 12 },
              { ext: "XLSX", color: "#1F6FE0", desc: "Pre-formatted · validation hints", size: "18 KB", count: 12 },
            ].map(t => (
              <div key={t.ext} style={{
                background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12,
                boxShadow: "var(--pc-shadow-xs)", padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{
                  width: 36, height: 44, borderRadius: 6,
                  background: t.color, color: "white",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--pc-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.04em",
                  position: "relative", flexShrink: 0,
                  boxShadow: "var(--pc-shadow-xs)",
                }}>
                  <span style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, background: "rgba(255,255,255,0.5)", borderRadius: "0 5px 0 4px" }} />
                  {t.ext}
                </span>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--pc-ink)" }}>Sample · 12 rows</div>
                  <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>{t.desc}</div>
                </div>
                <button className="pc-btn is-sm"><Icon name="download" size={12} />Download</button>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)", marginTop: 8, lineHeight: 1.5 }}>
            Templates demonstrate English + Hindi pairs, 5 question types, and the metadata structure PaperCraft expects.
          </div>
        </div>
      </div>

      {/* RIGHT — Instructions */}
      <aside>
        <div style={{ position: "sticky", top: 0 }}>
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>
            How import works
          </div>
          <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 14, boxShadow: "var(--pc-shadow-sm)", padding: "18px 20px" }}>
            {[
              { icon: "upload", title: "1. You upload, we parse", body: "CSV and XLSX both accepted. We never run remote services on your data — parsing happens in your session." },
              { icon: "sliders", title: "2. Map your columns to ours", body: "Auto-detected when possible. You confirm. Required PaperCraft fields are clearly marked." },
              { icon: "check", title: "3. Every row is validated", body: "Required fields, valid types, marks ranges, duplicates, and curriculum references. Nothing is skipped silently." },
              { icon: "eye", title: "4. You preview before commit", body: "See a row-by-row diff. Decide what to fix, what to import, what to skip." },
              { icon: "lock", title: "5. Imported as Draft", body: "Imported questions enter the Draft state. Approved papers and published questions are never modified by import." },
            ].map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--pc-line)" }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--pc-surface-3)", color: "var(--pc-ink-3)", display: "grid", placeItems: "center" }}>
                  <Icon name={r.icon} size={13} />
                </span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>{r.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", lineHeight: 1.5, marginTop: 2 }}>{r.body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Required columns reference */}
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, margin: "22px 0 10px" }}>
            Required columns
          </div>
          <div style={{ background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["questionTextEn","questionTextHi","questionType","class","subject","chapter","difficulty","marks"].map(c => (
              <span key={c} className="pc-mono pc-tag" style={{ fontSize: 10.5, color: "var(--pc-ink-2)" }}>{c}</span>
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, margin: "12px 0 6px" }}>
            Optional
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["topic","answer","solution","bloomLevel","estimatedMinutes","tags"].map(c => (
              <span key={c} className="pc-mono pc-tag is-outline" style={{ fontSize: 10.5 }}>{c}</span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  </CsvWizard>
);

// ═══════════════════════════════════════════════════════════════════════════
// ② MAP — Column mapping (CSV → PaperCraft)
// ═══════════════════════════════════════════════════════════════════════════

const PC_FIELDS = [
  // [value, label, required, group]
  ["questionTextEn",   "Question (English)",   true,  "core"],
  ["questionTextHi",   "Question (Hindi)",     true,  "core"],
  ["questionType",     "Question type",        true,  "core"],
  ["class",            "Class",                true,  "curriculum"],
  ["subject",          "Subject",              true,  "curriculum"],
  ["chapter",          "Chapter",              true,  "curriculum"],
  ["topic",            "Topic",                false, "curriculum"],
  ["difficulty",       "Difficulty",           true,  "meta"],
  ["marks",            "Marks",                true,  "meta"],
  ["bloomLevel",       "Bloom's level",        false, "meta"],
  ["estimatedMinutes", "Estimated minutes",    false, "meta"],
  ["answer",           "Answer",               false, "solution"],
  ["solution",         "Solution / steps",     false, "solution"],
  ["tags",             "Tags",                 false, "meta"],
  ["__skip",           "— Skip column —",      false, "skip"],
];

const MAPPING = [
  // csv column header, sample value, mapped field, confidence (auto-matched %)
  { csv: "Question_EN",     sample: "If the sum of two numbers is 32 and their difference is 8, find the numbers.", to: "questionTextEn",   conf: 98 },
  { csv: "Question_HI",     sample: "यदि दो संख्याओं का योग 32 और अंतर 8 है, तो संख्याएँ ज्ञात कीजिए।",                to: "questionTextHi",   conf: 98 },
  { csv: "Type",            sample: "Short Answer",                                                                  to: "questionType",     conf: 96 },
  { csv: "Standard",        sample: "6",                                                                             to: "class",            conf: 84 },
  { csv: "Subject",         sample: "Mathematics",                                                                   to: "subject",          conf: 99 },
  { csv: "Chapter_Name",    sample: "Knowing Our Numbers",                                                           to: "chapter",          conf: 92 },
  { csv: "Topic",           sample: "Estimation",                                                                    to: "topic",            conf: 95 },
  { csv: "Level",           sample: "Medium",                                                                        to: "difficulty",       conf: 88 },
  { csv: "Marks",           sample: "3",                                                                             to: "marks",            conf: 100 },
  { csv: "Bloom",           sample: "Apply",                                                                         to: "bloomLevel",       conf: 90 },
  { csv: "Time_Minutes",    sample: "5",                                                                             to: "estimatedMinutes", conf: 86 },
  { csv: "Answer_Key",      sample: "20 and 12",                                                                     to: "answer",           conf: 94 },
  { csv: "Worked_Solution", sample: "Let x and y be …",                                                              to: "solution",         conf: 89 },
  { csv: "Keywords",        sample: "sum, difference, linear",                                                       to: "tags",             conf: 82 },
  { csv: "Source_Book",     sample: "RBSE Class VI Textbook",                                                        to: "__skip",           conf: null },
];

const FieldPill = ({ field, conf, required }) => {
  const f = PC_FIELDS.find(p => p[0] === field) || PC_FIELDS[14];
  const isSkip = field === "__skip";
  return (
    <div style={{
      height: 36, padding: "0 10px 0 12px", borderRadius: 8,
      border: "1px solid " + (isSkip ? "var(--pc-line)" : "var(--pc-primary-200)"),
      background: isSkip ? "var(--pc-surface-2)" : "var(--pc-primary-50)",
      color: isSkip ? "var(--pc-ink-4)" : "var(--pc-primary-ink)",
      display: "inline-flex", alignItems: "center", gap: 9, fontSize: 12.5, fontWeight: 500,
      cursor: "pointer",
    }}>
      {!isSkip && <Icon name="check" size={11} style={{ color: "var(--pc-primary)" }} />}
      <span style={{ fontFamily: !isSkip ? "var(--pc-mono)" : "var(--pc-sans)", fontSize: !isSkip ? 11.5 : 12, fontStyle: isSkip ? "italic" : "normal" }}>{f[1]}</span>
      {required && <span className="pc-tag is-danger" style={{ height: 16, fontSize: 9.5, padding: "0 5px" }}>required</span>}
      {conf != null && !isSkip && (
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--pc-ink-4)" }}>
          <span className="pc-num">{conf}%</span>
        </span>
      )}
      <Icon name="chevDown" size={12} style={{ color: "var(--pc-ink-4)", marginLeft: conf != null && !isSkip ? 0 : "auto" }} />
    </div>
  );
};

const CsvMap = () => (
  <CsvWizard step="map"
    fileName="rbse_class6_math_chapter1.csv"
    fileMeta="99 rows · 15 columns · uploaded 14 seconds ago · 24 KB"
    footer={<CsvFooter
      left={
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12 }}>
          <span style={{ color: "var(--pc-ink-3)" }}>
            <span style={{ color: "var(--pc-success)", fontWeight: 500 }}>14 mapped</span> · <span style={{ color: "var(--pc-ink-4)" }}>1 skipped</span> · <span style={{ color: "var(--pc-success)", fontWeight: 500 }}>All required fields present</span>
          </span>
        </div>
      }
      right={<>
        <button className="pc-btn"><Icon name="arrowLeft" size={13} />Back</button>
        <button className="pc-btn is-primary">Next · Validate 99 rows<Icon name="arrowRight" size={13} /></button>
      </>}
    />}
  >
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", flex: 1, minHeight: 0 }}>
      <section className="pc-scroll" style={{ overflow: "auto", padding: "22px 26px 28px" }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Step 2 of 5</div>
          <h2 className="pc-serif" style={{ fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: "-0.022em" }}>Map your columns to PaperCraft fields</h2>
          <p style={{ fontSize: 12.5, color: "var(--pc-ink-3)", margin: "4px 0 0" }}>14 of 15 columns were auto-detected. Review the mappings and adjust any that look off.</p>
        </div>

        {/* Auto-detect banner */}
        <div style={{ background: "var(--pc-success-bg)", border: "1px solid #BCE5CF", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--pc-success)", color: "white", display: "grid", placeItems: "center" }}>
            <Icon name="sparkles" size={12} />
          </span>
          <div style={{ flex: 1, fontSize: 12.5, color: "#0E7A52", lineHeight: 1.5 }}>
            <strong style={{ fontWeight: 500 }}>Auto-detected 14 columns</strong> from headers and sample values. Confidence shown next to each mapping.
          </div>
          <button className="pc-btn is-sm">Reset all</button>
        </div>

        {/* Mapping table */}
        <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12, overflow: "hidden", boxShadow: "var(--pc-shadow-xs)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 28px 320px", background: "var(--pc-surface-2)", padding: "10px 14px", borderBottom: "1px solid var(--pc-line)" }}>
            {["CSV column", "Sample value (row 1)", "", "PaperCraft field"].map((h, i) => (
              <span key={i} style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{h}</span>
            ))}
          </div>
          {MAPPING.map((m, i) => {
            const pcField = PC_FIELDS.find(p => p[0] === m.to);
            const required = pcField && pcField[2];
            const isSkip = m.to === "__skip";
            return (
              <div key={m.csv} style={{
                display: "grid", gridTemplateColumns: "260px 1fr 28px 320px",
                padding: "11px 14px", borderBottom: i === MAPPING.length - 1 ? "none" : "1px solid var(--pc-line)",
                alignItems: "center",
                background: isSkip ? "rgba(0,0,0,0.015)" : "transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="drag" size={11} style={{ color: "var(--pc-ink-5)" }} />
                  <span className="pc-mono" style={{ fontSize: 11.5, fontWeight: 500, color: "var(--pc-ink)", background: "var(--pc-surface-3)", padding: "2px 7px", borderRadius: 4 }}>{m.csv}</span>
                </div>
                <div style={{ fontSize: 12, color: isSkip ? "var(--pc-ink-5)" : "var(--pc-ink-3)", lineHeight: 1.4, paddingRight: 14, fontStyle: m.csv.includes("HI") ? "normal" : "normal", fontFamily: m.csv.includes("HI") ? "var(--pc-serif)" : "var(--pc-sans)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {m.sample}
                </div>
                <Icon name="arrowRight" size={13} style={{ color: "var(--pc-ink-5)" }} />
                <FieldPill field={m.to} conf={m.conf} required={required} />
              </div>
            );
          })}
        </div>

        {/* Coverage check */}
        <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center", padding: "12px 16px", background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, boxShadow: "var(--pc-shadow-xs)" }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--pc-success-bg)", color: "var(--pc-success)", display: "grid", placeItems: "center" }}>
            <Icon name="check" size={13} stroke={3} />
          </span>
          <span style={{ fontSize: 12.5, color: "var(--pc-ink-2)" }}>
            <strong style={{ fontWeight: 500 }}>All 8 required fields are mapped.</strong> 14 of 15 source columns are in use.
          </span>
        </div>
      </section>

      {/* Right preview panel */}
      <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "22px 22px", overflow: "auto" }}>
        <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>
          Row 1 preview · as PaperCraft will see it
        </div>
        <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12, boxShadow: "var(--pc-shadow-xs)", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--pc-line)" }}>
            <span className="pc-mono" style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>Row 1</span>
            <span className="pc-tag is-outline" style={{ height: 18, fontSize: 10 }}>Mathematics</span>
            <span className="pc-tag is-outline" style={{ height: 18, fontSize: 10 }}>Class VI</span>
            <span className="pc-tag is-warning" style={{ height: 18, fontSize: 10, marginLeft: "auto" }}>will be Draft</span>
          </div>

          <div className="pc-serif" style={{ fontSize: 13.5, color: "var(--pc-ink)", lineHeight: 1.5, marginBottom: 6 }}>
            If the sum of two numbers is 32 and their difference is 8, find the numbers.
          </div>
          <div className="pc-serif" style={{ fontSize: 12, color: "var(--pc-ink-3)", lineHeight: 1.5, marginBottom: 10 }}>
            यदि दो संख्याओं का योग 32 और अंतर 8 है, तो संख्याएँ ज्ञात कीजिए।
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", marginBottom: 10 }}>
            <span className="pc-tag is-ink" style={{ height: 18, fontSize: 10 }}>Short Answer</span>
            <span style={{ fontSize: 11, color: "var(--pc-ink-3)" }}><span className="pc-num" style={{ fontWeight: 500, color: "var(--pc-ink-2)" }}>3</span> marks</span>
            <Difficulty level={3} />
            <span style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>Apply · 5 min</span>
          </div>

          <div style={{ paddingTop: 10, borderTop: "1px dashed var(--pc-line)" }}>
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>Chapter</div>
            <div style={{ fontSize: 12, color: "var(--pc-ink-2)" }}>Knowing Our Numbers → Estimation</div>
          </div>
        </div>

        <div style={{ marginTop: 14, padding: 12, background: "var(--pc-info-bg)", border: "1px solid #C9D4FF", borderRadius: 10, fontSize: 11.5, color: "#3F4F8C", lineHeight: 1.55, display: "flex", gap: 9, alignItems: "flex-start" }}>
          <Icon name="info" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          <span><strong style={{ fontWeight: 500 }}>Unmapped column:</strong> <span className="pc-mono">Source_Book</span> won't be imported. You can add it to PaperCraft as a custom tag if needed.</span>
        </div>
      </aside>
    </div>
  </CsvWizard>
);

// ═══════════════════════════════════════════════════════════════════════════
// ③ VALIDATE — Row-by-row preview with valid / warning / failed
// ═══════════════════════════════════════════════════════════════════════════

const ROWS = [
  // [row, body, status, issue?, chapter?]
  { r: 1,  state: "ok",      body: "If the sum of two numbers is 32 and their difference is 8, find the numbers.",     subj: "Math · VI", chap: "Knowing Our Numbers" },
  { r: 2,  state: "ok",      body: "Round 8,475 to the nearest hundred.",                                              subj: "Math · VI", chap: "Knowing Our Numbers" },
  { r: 3,  state: "warn",    body: "गोलाई के बिना 1,99,999 का अनुमान लगाइए।",                                            issue: "Missing English version", subj: "Math · VI", chap: "Knowing Our Numbers" },
  { r: 4,  state: "ok",      body: "Express 4500 in standard form.",                                                   subj: "Math · VI", chap: "Knowing Our Numbers" },
  { r: 5,  state: "fail",    body: "—",                                                                                issue: "Required field empty · questionTextEn, marks",     subj: "—",     chap: "—" },
  { r: 6,  state: "newchap", body: "Find the place value of 7 in 47,083.",                                             issue: "New chapter · 'Place Value Systems' will be created", subj: "Math · VI", chap: "Place Value Systems", newCh: true },
  { r: 7,  state: "ok",      body: "Compare 9,87,654 and 9,78,654 using <, >, =.",                                     subj: "Math · VI", chap: "Knowing Our Numbers" },
  { r: 8,  state: "warn",    body: "Round 6,789 to the nearest thousand.",                                             issue: "Duplicate of row 9 (96% similar)", subj: "Math · VI", chap: "Knowing Our Numbers" },
  { r: 9,  state: "warn",    body: "Round 6,789 to the nearest thousand.",                                             issue: "Duplicate of row 8 (96% similar)", subj: "Math · VI", chap: "Knowing Our Numbers" },
  { r: 10, state: "fail",    body: "Solve for x: 5x + 12 = 37.",                                                       issue: "Invalid type 'sa' · expected MCQ / Short / Long / TF / Fill", subj: "Math · VII", chap: "Linear Equations" },
  { r: 11, state: "ok",      body: "The HCF of two numbers is 12. Their product is 1,440. Find their LCM.",            subj: "Math · VI", chap: "Playing With Numbers" },
  { r: 12, state: "warn",    body: "एक बक्से में 24 सेब हैं। ऐसे 15 बक्सों में कुल कितने सेब होंगे?",                            issue: "Bloom's level 'apply.' unrecognised — defaulting to Apply", subj: "Math · VI", chap: "Whole Numbers" },
  { r: 13, state: "ok",      body: "Write 1,00,000 as the sum of place values.",                                       subj: "Math · VI", chap: "Knowing Our Numbers" },
  { r: 14, state: "fail",    body: "True or false: every prime number is odd.",                                        issue: "Marks value '0.5' outside allowed range (1–10)", subj: "Math · VI", chap: "Playing With Numbers" },
];

const StateBadge = ({ state }) => {
  const cfg = {
    ok:      { tone: "is-success", label: "Valid",    icon: "check" },
    warn:    { tone: "is-warning", label: "Warning",  icon: "warn" },
    fail:    { tone: "is-danger",  label: "Failed",   icon: "warn" },
    newchap: { tone: "is-primary", label: "New ref",  icon: "plus" },
  }[state];
  return (
    <span className={"pc-tag " + cfg.tone} style={{ height: 20, fontSize: 10.5, padding: "0 8px" }}>
      <Icon name={cfg.icon} size={10} />
      {cfg.label}
    </span>
  );
};

const FilterTab = ({ active, label, count, color, onClick }) => (
  <button onClick={onClick} style={{
    padding: "6px 12px", borderRadius: 8,
    border: "1px solid " + (active ? "var(--pc-line)" : "transparent"),
    background: active ? "var(--pc-surface)" : "transparent",
    boxShadow: active ? "var(--pc-shadow-xs)" : "none",
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
    fontFamily: "var(--pc-sans)",
  }}>
    {color && <span style={{ width: 8, height: 8, borderRadius: 4, background: color }} />}
    <span style={{ fontSize: 12.5, color: active ? "var(--pc-ink)" : "var(--pc-ink-3)", fontWeight: active ? 500 : 400 }}>{label}</span>
    <span className="pc-num" style={{ fontSize: 11, color: active ? "var(--pc-ink-3)" : "var(--pc-ink-4)", background: active ? "var(--pc-surface-3)" : "transparent", padding: "1px 6px", borderRadius: 999 }}>{count}</span>
  </button>
);

const CsvValidate = () => (
  <CsvWizard step="validate"
    fileName="rbse_class6_math_chapter1.csv"
    fileMeta="99 rows scanned · validation complete in 1.4 s"
    footer={<CsvFooter
      left={
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--pc-ink-3)" }}>
          <span><strong style={{ color: "var(--pc-success)", fontWeight: 500 }}>84 ready</strong> · <strong style={{ color: "var(--pc-warning)", fontWeight: 500 }}>12 warnings</strong> · <strong style={{ color: "var(--pc-danger)", fontWeight: 500 }}>3 failed</strong></span>
          <span style={{ width: 1, height: 14, background: "var(--pc-line)" }} />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--pc-ink-2)", cursor: "pointer" }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--pc-primary)", display: "grid", placeItems: "center" }}>
              <Icon name="check" size={9} style={{ color: "white", strokeWidth: 3 }} />
            </span>
            Include warning rows in import
          </label>
        </div>
      }
      right={<>
        <button className="pc-btn"><Icon name="arrowLeft" size={13} />Back</button>
        <button className="pc-btn"><Icon name="download" size={13} />Export failed rows</button>
        <button className="pc-btn is-primary">Continue · 96 rows<Icon name="arrowRight" size={13} /></button>
      </>}
    />}
  >
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", flex: 1, minHeight: 0 }}>
      <section className="pc-scroll" style={{ overflow: "auto", padding: "22px 26px 28px" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Step 3 of 5</div>
          <h2 className="pc-serif" style={{ fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: "-0.022em" }}>
            Validation results <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>· 99 rows scanned</span>
          </h2>
          <p style={{ fontSize: 12.5, color: "var(--pc-ink-3)", margin: "4px 0 0" }}>Nothing is silently skipped. Decide what to fix, what to import, what to skip.</p>
        </div>

        {/* Summary tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Valid rows",   v: 84, accent: "var(--pc-success)", spark: [4,6,5,8,7,10,9,12,11,14] },
            { label: "Warnings",     v: 12, accent: "var(--pc-warning)", spark: [3,2,4,3,5,4,6,5,4,7] },
            { label: "Failed rows",  v: 3,  accent: "var(--pc-danger)",  spark: [1,0,1,2,0,1,0,1,0,1] },
            { label: "New curriculum refs", v: 1, accent: "var(--pc-primary)", spark: null },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "12px 14px", boxShadow: "var(--pc-shadow-xs)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: s.accent }} />
                <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>{s.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 4 }}>
                <span className="pc-serif pc-num" style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.v}</span>
                {s.spark && <div style={{ flex: 1, height: 24 }}><Spark points={s.spark} color={s.accent} height={24} /></div>}
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12, padding: "4px 6px", background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 10, width: "fit-content" }}>
          <FilterTab active label="All" count={99} />
          <FilterTab label="Valid" count={84} color="var(--pc-success)" />
          <FilterTab label="Warnings" count={12} color="var(--pc-warning)" />
          <FilterTab label="Failed" count={3} color="var(--pc-danger)" />
          <FilterTab label="New refs" count={1} color="var(--pc-primary)" />
        </div>

        {/* Validation table */}
        <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12, overflow: "hidden", boxShadow: "var(--pc-shadow-xs)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 110px 130px 60px", background: "var(--pc-surface-2)", padding: "10px 14px", borderBottom: "1px solid var(--pc-line)" }}>
            {["Row", "Question / issue", "Subject", "Chapter", "Status", ""].map((h, i) => (
              <span key={i} style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{h}</span>
            ))}
          </div>
          {ROWS.map((row, i) => (
            <div key={row.r} style={{
              display: "grid", gridTemplateColumns: "60px 1fr 120px 110px 130px 60px",
              padding: "11px 14px", borderBottom: i === ROWS.length - 1 ? "none" : "1px solid var(--pc-line)",
              alignItems: "start",
              background: row.state === "fail" ? "rgba(220,74,61,0.04)" : row.state === "warn" ? "rgba(224,138,31,0.03)" : row.state === "newchap" ? "rgba(53,92,255,0.03)" : "transparent",
            }}>
              <span className="pc-mono pc-num" style={{ fontSize: 11.5, color: "var(--pc-ink-3)", paddingTop: 2 }}>{String(row.r).padStart(3, "0")}</span>
              <div style={{ paddingRight: 14 }}>
                <div className="pc-serif" style={{ fontSize: 13, color: row.state === "fail" ? "var(--pc-ink-4)" : "var(--pc-ink)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", fontStyle: row.state === "fail" && row.body === "—" ? "italic" : "normal" }}>
                  {row.body}
                </div>
                {row.issue && (
                  <div style={{ marginTop: 4, fontSize: 11, color: row.state === "fail" ? "var(--pc-danger)" : row.state === "newchap" ? "var(--pc-primary)" : "var(--pc-warning)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Icon name={row.state === "fail" ? "warn" : row.state === "newchap" ? "plus" : "info"} size={10} />
                    {row.issue}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 11.5, color: "var(--pc-ink-3)", paddingTop: 2 }}>{row.subj}</span>
              <span style={{ fontSize: 11.5, color: row.newCh ? "var(--pc-primary)" : "var(--pc-ink-3)", paddingTop: 2, fontWeight: row.newCh ? 500 : 400 }}>{row.chap}</span>
              <span style={{ paddingTop: 1 }}><StateBadge state={row.state} /></span>
              <span style={{ display: "flex", justifyContent: "flex-end", gap: 4, paddingTop: 1 }}>
                <button style={{ width: 22, height: 22, borderRadius: 5, border: 0, background: "transparent", color: "var(--pc-ink-4)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="edit" size={11} /></button>
                <button style={{ width: 22, height: 22, borderRadius: 5, border: 0, background: "transparent", color: "var(--pc-ink-4)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="dots" size={11} /></button>
              </span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 11.5, color: "var(--pc-ink-4)" }}>
          Showing 14 of 99 · <a href="#" style={{ color: "var(--pc-primary)", textDecoration: "none" }}>load 85 more</a>
        </div>
      </section>

      {/* Right — Issues breakdown */}
      <aside style={{ borderLeft: "1px solid var(--pc-line)", background: "var(--pc-surface-2)", padding: "22px 22px", overflow: "auto" }}>
        <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Issues by category</div>

        {[
          { tone: "var(--pc-danger)",  bg: "var(--pc-danger-bg)",  icon: "warn",  title: "Required field empty",  n: 2, body: "Rows 5 · 87. Both missing questionTextEn." },
          { tone: "var(--pc-danger)",  bg: "var(--pc-danger-bg)",  icon: "warn",  title: "Invalid question type",  n: 1, body: "Row 10 · expected MCQ / Short / Long / TF / Fill." },
          { tone: "var(--pc-warning)", bg: "var(--pc-warning-bg)", icon: "info",  title: "Marks out of range",     n: 1, body: "Row 14 · 0.5 not allowed. Range is 1–10." },
          { tone: "var(--pc-warning)", bg: "var(--pc-warning-bg)", icon: "info",  title: "Duplicate / near-duplicate", n: 4, body: "2 pairs detected by text similarity ≥ 90%." },
          { tone: "var(--pc-warning)", bg: "var(--pc-warning-bg)", icon: "info",  title: "Missing translation pair",   n: 6, body: "Hindi only · English version absent." },
          { tone: "var(--pc-warning)", bg: "var(--pc-warning-bg)", icon: "info",  title: "Unrecognised metadata",      n: 1, body: "Bloom value 'apply.' coerced to Apply." },
        ].map((it, i) => (
          <div key={i} style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 10, padding: "11px 13px", boxShadow: "var(--pc-shadow-xs)", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 20, height: 20, borderRadius: 5, background: it.bg, color: it.tone, display: "grid", placeItems: "center" }}>
                <Icon name={it.icon} size={11} />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)", flex: 1 }}>{it.title}</span>
              <span className="pc-num" style={{ fontSize: 11.5, color: "var(--pc-ink-3)" }}>{it.n}</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", lineHeight: 1.5 }}>{it.body}</div>
          </div>
        ))}

        {/* New chapter prompt */}
        <div style={{ marginTop: 16, background: "linear-gradient(180deg, #F1F4FF, #E7ECFF)", border: "1px solid #C9D4FF", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, #2A47CC, #6789FF)", color: "white", display: "grid", placeItems: "center" }}>
              <Icon name="folder" size={12} />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-primary-ink)" }}>1 new chapter referenced</span>
          </div>
          <div style={{ fontSize: 11.5, color: "#3F4F8C", lineHeight: 1.5, marginBottom: 8 }}>
            <strong style={{ fontWeight: 500 }}>"Place Value Systems"</strong> doesn't exist in Mathematics · Class VI. Create it as part of this import?
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="pc-btn is-sm is-primary">Create chapter</button>
            <button className="pc-btn is-sm">Map to existing</button>
          </div>
        </div>
      </aside>
    </div>
  </CsvWizard>
);

// ═══════════════════════════════════════════════════════════════════════════
// ④ SUMMARY — Pre-commit confirmation
// ═══════════════════════════════════════════════════════════════════════════

const CsvSummary = () => (
  <CsvWizard step="summary"
    fileName="rbse_class6_math_chapter1.csv"
    fileMeta="Ready to commit · 96 rows will be written to the questions collection"
    footer={<CsvFooter
      left={
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--pc-ink-2)", cursor: "pointer" }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--pc-primary)", display: "grid", placeItems: "center" }}>
            <Icon name="check" size={9} style={{ color: "white", strokeWidth: 3 }} />
          </span>
          I understand all questions arrive as <strong style={{ fontWeight: 500 }}>Draft</strong> and won't appear in approved papers.
        </label>
      }
      right={<>
        <button className="pc-btn"><Icon name="arrowLeft" size={13} />Back</button>
        <button className="pc-btn is-primary"><Icon name="upload" size={13} />Import 96 questions as Draft</button>
      </>}
    />}
  >
    <div className="pc-scroll" style={{ overflow: "auto", padding: "30px 36px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Step 4 of 5 · Final review</div>
        <h2 className="pc-serif" style={{ fontSize: 28, fontWeight: 500, margin: 0, letterSpacing: "-0.025em" }}>
          You're about to import <span className="pc-num">96 questions</span>
        </h2>
        <p style={{ fontSize: 13, color: "var(--pc-ink-3)", margin: "6px 0 0", lineHeight: 1.5 }}>
          84 valid · 12 warnings (you chose to include) · 3 failed (will be skipped). All imported rows arrive in Draft state.
        </p>
      </div>

      {/* Totals strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 14, boxShadow: "var(--pc-shadow-sm)", overflow: "hidden", marginBottom: 18 }}>
        {[
          { label: "Will import", v: "96", unit: "rows", hint: "as Draft", accent: "var(--pc-success)" },
          { label: "Skipped",     v: "3",  unit: "rows", hint: "failed validation", accent: "var(--pc-danger)" },
          { label: "New refs",    v: "1",  unit: "chapter", hint: "Place Value Systems", accent: "var(--pc-primary)" },
          { label: "Source file", v: "99", unit: "rows total", hint: "rbse_class6_math.csv", accent: "var(--pc-ink-3)" },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: "20px 22px", borderLeft: i === 0 ? "none" : "1px solid var(--pc-line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: s.accent }} />
              <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span className="pc-serif pc-num" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.025em" }}>{s.v}</span>
              <span style={{ fontSize: 12, color: "var(--pc-ink-4)" }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", marginTop: 4 }}>{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Two-column body */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
        {/* Breakdown */}
        <div className="pc-panel pc-panel-pad">
          <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 12 }}>Breakdown by subject &amp; chapter</div>
          {[
            { subj: "Mathematics · VI",  rows: [["Knowing Our Numbers", 42], ["Whole Numbers", 18], ["Playing With Numbers", 14], ["Place Value Systems", 4, true]] },
            { subj: "Mathematics · VII", rows: [["Linear Equations", 12]] },
            { subj: "Mathematics · VIII", rows: [["Rational Numbers", 6]] },
          ].map((g, i) => (
            <div key={i} style={{ marginBottom: i === 2 ? 0 : 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="pc-serif" style={{ fontSize: 14, fontWeight: 500, color: "var(--pc-ink)" }}>{g.subj}</span>
                <span style={{ flex: 1, height: 1, background: "var(--pc-line)" }} />
                <span className="pc-num" style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>{g.rows.reduce((a, r) => a + r[1], 0)} questions</span>
              </div>
              {g.rows.map((r, j) => {
                const total = g.rows.reduce((a, x) => a + x[1], 0);
                const pct = Math.round((r[1] / total) * 100);
                return (
                  <div key={j} style={{ display: "grid", gridTemplateColumns: "180px 1fr 70px", alignItems: "center", gap: 12, padding: "5px 0", fontSize: 12 }}>
                    <span style={{ color: "var(--pc-ink-2)", display: "flex", alignItems: "center", gap: 6 }}>
                      {r[0]}
                      {r[2] && <span className="pc-tag is-success" style={{ height: 16, fontSize: 9.5 }}>new</span>}
                    </span>
                    <div className="pc-bar is-primary"><span style={{ width: pct + "%" }} /></div>
                    <span className="pc-num" style={{ fontSize: 11.5, color: "var(--pc-ink-3)", textAlign: "right" }}>{r[1]} · {pct}%</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right column — rules and rollback */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Draft notice */}
          <div style={{ background: "linear-gradient(180deg, #FFFCEC, #FBF2DF)", border: "1px solid #F0D798", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: "var(--pc-warning)", color: "white", display: "grid", placeItems: "center" }}>
                <Icon name="lock" size={13} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#7A4F0E" }}>Imports as Draft</span>
            </div>
            <div style={{ fontSize: 12, color: "#7A4F0E", lineHeight: 1.5 }}>
              Imported questions never auto-publish. They appear in the Repository with status <strong style={{ fontWeight: 500 }}>Draft</strong>, ready for review and approval by an admin.
            </div>
          </div>

          {/* Metadata to be written */}
          <div className="pc-panel pc-panel-pad">
            <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Metadata recorded per question</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                ["createdBy",   "Aarav Kapoor (admin)"],
                ["importedAt",  "23 May 2026 · 14:42 IST"],
                ["source",      "bulk_import"],
                ["sourceFile",  "rbse_class6_math_chapter1.csv"],
                ["batchId",     "imp_2k9x4q"],
                ["status",      "draft"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "130px 1fr", fontSize: 11.5, alignItems: "center" }}>
                  <span className="pc-mono" style={{ color: "var(--pc-ink-3)" }}>{k}</span>
                  <span style={{ color: "var(--pc-ink-2)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rollback */}
          <div style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-line)", borderRadius: 12, padding: "14px 16px", boxShadow: "var(--pc-shadow-xs)", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: "var(--pc-surface-3)", color: "var(--pc-ink-3)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon name="refresh" size={13} />
            </span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>Reversible for 24 hours</div>
              <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", lineHeight: 1.5, marginTop: 3 }}>
                Roll back this batch from the Repository's import history. Soft-delete only — nothing is removed permanently.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CsvWizard>
);

// ═══════════════════════════════════════════════════════════════════════════
// ⑤ COMPLETE — Success state
// ═══════════════════════════════════════════════════════════════════════════

const CsvComplete = () => (
  <div className="pc-screen">
    <div className="pc-shell">
      <Sidebar role="admin" active="repo" items={ADMIN_NAV}
        footName="Aarav Kapoor" footRole="Vice Principal · Admin" footAvatar="AK" footAvatarClass="is-blue" />
      <div className="pc-work">
        <Topbar crumbs={["Academic", "Question Repository", "Bulk Import", "Complete"]} actions={null} />

        <div className="pc-scroll" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "40px 36px", background: "var(--pc-bg)" }}>
          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            {/* Hero */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: "linear-gradient(160deg, #1ED68A, #14B87A 60%, #0E9560)",
                color: "white", display: "grid", placeItems: "center", flexShrink: 0,
                boxShadow: "0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 20px -4px rgba(20,184,122,0.6)",
              }}>
                <Icon name="check" size={32} stroke={2.2} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Step 5 of 5 · Import complete</div>
                <h1 className="pc-serif" style={{ fontSize: 34, fontWeight: 500, margin: 0, letterSpacing: "-0.028em", lineHeight: 1.05 }}>
                  96 questions imported <span style={{ color: "var(--pc-ink-4)", fontStyle: "italic", fontWeight: 400 }}>as Draft</span>
                </h1>
                <div style={{ fontSize: 13.5, color: "var(--pc-ink-3)", marginTop: 6 }}>
                  Took 3.2 seconds · written to <span className="pc-mono" style={{ background: "var(--pc-surface-3)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>questions</span> · batch <span className="pc-mono" style={{ background: "var(--pc-surface-3)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>imp_2k9x4q</span>
                </div>
              </div>
            </div>

            {/* Status callout */}
            <div style={{
              background: "linear-gradient(180deg, #FFFCEC, #FBF2DF)",
              border: "1px solid #F0D798", borderRadius: 14,
              padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, marginBottom: 18,
            }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--pc-warning)", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name="lock" size={18} />
              </span>
              <div style={{ flex: 1 }}>
                <div className="pc-serif" style={{ fontSize: 16, fontWeight: 500, color: "#5C3A07" }}>
                  Imported as Draft — review before publishing
                </div>
                <div style={{ fontSize: 12.5, color: "#7A4F0E", marginTop: 3, lineHeight: 1.5 }}>
                  All 96 questions are in Draft state. They won't appear in approved papers until an admin reviews and approves them in the Repository.
                </div>
              </div>
              <button className="pc-btn is-primary"><Icon name="eye" size={13} />Review Drafts</button>
            </div>

            {/* Outcome panels */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
              {/* Imported summary */}
              <div className="pc-panel pc-panel-pad">
                <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>What landed in the repository</span>
                  <span style={{ marginLeft: "auto", display: "inline-flex", gap: 14, fontSize: 11.5, color: "var(--pc-ink-3)" }}>
                    <span><span className="pc-num" style={{ color: "var(--pc-success)", fontWeight: 500 }}>84</span> valid</span>
                    <span><span className="pc-num" style={{ color: "var(--pc-warning)", fontWeight: 500 }}>12</span> warnings</span>
                    <span><span className="pc-num" style={{ color: "var(--pc-danger)", fontWeight: 500 }}>3</span> failed</span>
                  </span>
                </div>

                {/* Outcome bar */}
                <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", border: "1px solid var(--pc-line)", marginBottom: 14 }}>
                  <div style={{ width: "84.85%", background: "var(--pc-success)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 500 }}>84 valid</div>
                  <div style={{ width: "12.12%", background: "var(--pc-warning)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 500 }}>12 warn</div>
                  <div style={{ width: "3.03%", background: "var(--pc-danger)" }} />
                </div>

                {/* Items list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { icon: "folder", title: "Knowing Our Numbers · VI",      meta: "42 questions · 38 valid · 4 warn",  tone: "var(--pc-success)" },
                    { icon: "folder", title: "Whole Numbers · VI",            meta: "18 questions · 16 valid · 2 warn",  tone: "var(--pc-success)" },
                    { icon: "folder", title: "Playing With Numbers · VI",     meta: "14 questions · 12 valid · 2 warn",  tone: "var(--pc-success)" },
                    { icon: "plus",   title: "Place Value Systems · VI",      meta: "4 questions · new chapter created", tone: "var(--pc-primary)" },
                    { icon: "folder", title: "Linear Equations · VII",        meta: "12 questions · 10 valid · 2 warn",  tone: "var(--pc-success)" },
                    { icon: "folder", title: "Rational Numbers · VIII",       meta: "6 questions · 6 valid",             tone: "var(--pc-success)" },
                  ].map((it, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 8 }}>
                      <span style={{ width: 26, height: 26, borderRadius: 6, background: "var(--pc-surface)", border: "1px solid var(--pc-line)", color: it.tone, display: "grid", placeItems: "center" }}>
                        <Icon name={it.icon} size={13} />
                      </span>
                      <div style={{ flex: 1, lineHeight: 1.3 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>{it.title}</div>
                        <div style={{ fontSize: 11.5, color: "var(--pc-ink-4)" }}>{it.meta}</div>
                      </div>
                      <Icon name="arrowRight" size={13} style={{ color: "var(--pc-ink-4)" }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Failed rows */}
                <div className="pc-panel pc-panel-pad">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--pc-danger-bg)", color: "var(--pc-danger)", display: "grid", placeItems: "center" }}>
                      <Icon name="warn" size={12} />
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-ink)" }}>3 rows failed validation</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--pc-ink-3)", lineHeight: 1.5, marginBottom: 10 }}>
                    Rows 5, 10, 14 didn't pass validation and were not imported. Download them, fix them, and re-import in the same flow.
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="pc-btn is-sm"><Icon name="download" size={11} />Download failed rows</button>
                    <button className="pc-btn is-sm is-ghost">View log</button>
                  </div>
                </div>

                {/* Next steps */}
                <div className="pc-panel pc-panel-pad">
                  <div style={{ fontSize: 10.5, color: "var(--pc-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>Suggested next steps</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["eye",      "Review 96 Drafts",   "Approve and tag as you go"],
                      ["users",    "Assign to authors",  "Delegate to subject teachers"],
                      ["target",   "Map to blueprints",  "Align to RBSE Class VI–VIII"],
                      ["refresh",  "Roll back this batch", "Available for 24 hours"],
                    ].map(([icon, title, desc]) => (
                      <button key={title} style={{ background: "var(--pc-surface-2)", border: "1px solid var(--pc-line)", borderRadius: 8, padding: "9px 11px", display: "flex", gap: 10, alignItems: "center", cursor: "pointer", fontFamily: "var(--pc-sans)" }}>
                        <span style={{ width: 24, height: 24, borderRadius: 6, background: "var(--pc-surface)", border: "1px solid var(--pc-line)", color: "var(--pc-ink-3)", display: "grid", placeItems: "center" }}>
                          <Icon name={icon} size={12} />
                        </span>
                        <div style={{ flex: 1, textAlign: "left", lineHeight: 1.3 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--pc-ink)" }}>{title}</div>
                          <div style={{ fontSize: 11, color: "var(--pc-ink-4)" }}>{desc}</div>
                        </div>
                        <Icon name="arrowRight" size={12} style={{ color: "var(--pc-ink-4)" }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer CTA row */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 28 }}>
              <button className="pc-btn is-primary is-lg"><Icon name="archive" size={14} />Go to Repository</button>
              <button className="pc-btn is-lg"><Icon name="upload" size={14} />Import another file</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { CsvUpload, CsvMap, CsvValidate, CsvSummary, CsvComplete });
