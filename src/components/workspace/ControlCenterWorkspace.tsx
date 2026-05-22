export function ControlCenterWorkspace() {
  return (
    <main
      className="pc-scroll"
      style={{
        flex: 1,
        padding: '24px 28px 32px',
        background: 'var(--pc-bg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 22,
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--pc-ink-4)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 500,
              marginBottom: 6,
            }}
          >
            Tuesday · 21 May 2026 · Term II in progress
          </div>
          <h1
            className="pc-serif"
            style={{
              fontSize: 34,
              margin: 0,
              letterSpacing: '-0.028em',
              lineHeight: 1.1,
            }}
          >
            Academic Control Center
            <span
              style={{
                color: 'var(--pc-ink-4)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {' '}
              — visual foundation
            </span>
          </h1>
        </div>
      </div>

      <div
        className="pc-panel pc-panel-pad"
        style={{
          marginBottom: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
        }}
      >
        {['Overview', 'Approvals', 'Coverage', 'Activity'].map((label) => (
          <div key={label}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--pc-ink-4)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              {label}
            </div>
            <div className="pc-panel-placeholder" style={{ minHeight: 72 }}>
              —
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.55fr 1fr',
          gap: 20,
        }}
      >
        <div className="pc-panel pc-panel-pad">
          <h2 className="pc-serif" style={{ fontSize: 18, margin: '0 0 14px' }}>
            Approval Pipeline
          </h2>
          <div className="pc-panel-placeholder" style={{ minHeight: 220 }}>
            Placeholder panel
          </div>
        </div>

        <div className="pc-panel pc-panel-pad">
          <h2 className="pc-serif" style={{ fontSize: 18, margin: '0 0 14px' }}>
            Academic Health
          </h2>
          <div className="pc-panel-placeholder" style={{ minHeight: 220 }}>
            Placeholder panel
          </div>
        </div>
      </div>

      <div className="pc-panel pc-panel-pad" style={{ marginTop: 20 }}>
        <h2 className="pc-serif" style={{ fontSize: 18, margin: '0 0 14px' }}>
          Recent Activity
        </h2>
        <div className="pc-panel-placeholder" style={{ minHeight: 120 }}>
          Placeholder feed
        </div>
      </div>
    </main>
  )
}
