import { CheckCheck, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MotionOverlay } from '@/components/motion/MotionOverlay'
import { FadeIn } from '@/components/motion/FadeIn'
import { MotionList, MotionListItem } from '@/components/motion/MotionList'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationContext'
import { notificationHref } from '@/lib/notification-routes'
import type { NotificationRecord } from '@/types/notification'

function formatTime(ms: number): string {
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function toneClass(type: NotificationRecord['type']): string {
  if (type === 'paper_approved') return 'is-success'
  if (type === 'paper_submitted') return 'is-primary'
  if (type.includes('warning') || type === 'curriculum_warning') return 'is-warning'
  return ''
}

type Props = {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { notifications, loading, markRead, markAllRead, clear } = useNotifications()

  const unread = notifications.filter((n) => !n.read)
  const read = notifications.filter((n) => n.read)

  async function openNotification(n: NotificationRecord) {
    if (!n.read) await markRead(n.id)
    const href = notificationHref(n, isAdmin)
    if (href) {
      navigate(href)
      onClose()
    }
  }

  return (
    <MotionOverlay
      open={open}
      onClose={onClose}
      placement="right"
      overlayClassName="pc-notify-backdrop"
      backdropClassName="pc-notify-backdrop-hit"
      panelClassName="pc-notify-panel"
      ariaLabel="Notifications"
    >
      <header className="pc-notify-head">
        <div>
          <h2 className="pc-notify-title pc-serif">Notifications</h2>
          <p className="pc-notify-sub">
            {unread.length > 0
              ? `${unread.length} unread`
              : 'Operational updates from papers and imports'}
          </p>
        </div>
        <div className="pc-notify-head-actions">
          {unread.length > 0 ? (
            <button
              type="button"
              className="pc-btn is-sm is-ghost"
              onClick={() => void markAllRead()}
            >
              <CheckCheck size={13} strokeWidth={1.6} />
              Mark all read
            </button>
          ) : null}
          <button type="button" className="pc-icon-btn" onClick={onClose} aria-label="Close">
            <X size={15} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <div className="pc-notify-body pc-scroll">
        {loading ? (
          <p className="pc-notify-empty">Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="pc-notify-empty">No notifications yet.</p>
        ) : (
          <FadeIn>
            {unread.length > 0 ? (
              <section>
                <h3 className="pc-notify-group-label">Unread</h3>
                <MotionList as="ul" className="pc-notify-list">
                  {unread.map((n) => (
                    <MotionListItem
                      key={n.id}
                      as="li"
                      className={`pc-notify-item${n.read ? ' is-read' : ''}`}
                    >
                      <NotificationRow
                        notification={n}
                        onOpen={() => void openNotification(n)}
                        onClear={() => void clear(n.id)}
                      />
                    </MotionListItem>
                  ))}
                </MotionList>
              </section>
            ) : null}
            {read.length > 0 ? (
              <section>
                <h3 className="pc-notify-group-label">Earlier</h3>
                <MotionList as="ul" className="pc-notify-list">
                  {read.map((n) => (
                    <MotionListItem
                      key={n.id}
                      as="li"
                      className={`pc-notify-item${n.read ? ' is-read' : ''}`}
                    >
                      <NotificationRow
                        notification={n}
                        onOpen={() => void openNotification(n)}
                        onClear={() => void clear(n.id)}
                      />
                    </MotionListItem>
                  ))}
                </MotionList>
              </section>
            ) : null}
          </FadeIn>
        )}
      </div>
    </MotionOverlay>
  )
}

function NotificationRow({
  notification: n,
  onOpen,
  onClear,
}: {
  notification: NotificationRecord
  onOpen: () => void
  onClear: () => void
}) {
  return (
    <>
      <button type="button" className="pc-notify-item-main" onClick={onOpen}>
        <span className={`pc-tag ${toneClass(n.type)}`}>{n.title}</span>
        <p className="pc-notify-item-msg">{n.message}</p>
        <time className="pc-notify-item-time">{formatTime(n.createdAtMs)}</time>
      </button>
      <button
        type="button"
        className="pc-notify-item-clear"
        title="Clear"
        onClick={(e) => {
          e.stopPropagation()
          onClear()
        }}
      >
        <Trash2 size={12} strokeWidth={1.6} />
      </button>
    </>
  )
}
