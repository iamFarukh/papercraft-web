import { Camera, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  parseProfileSaveError,
  removeProfilePhoto,
  uploadProfilePhoto,
} from '@/services/firebase/profile'

type Props = {
  uid: string
  displayName: string
  photoURL: string | null
  size?: 'lg' | 'md'
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfilePhotoControl({
  uid,
  displayName,
  photoURL,
  size = 'lg',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      await uploadProfilePhoto(uid, file)
    } catch (err) {
      setError(parseProfileSaveError(err))
    } finally {
      setBusy(false)
    }
  }

  async function onRemove() {
    setBusy(true)
    setError(null)
    try {
      await removeProfilePhoto(uid)
    } catch (err) {
      setError(parseProfileSaveError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`pc-profile-photo is-${size}`}>
      <div className="pc-profile-photo-ring">
        {photoURL ? (
          <img src={photoURL} alt="" className="pc-profile-photo-img" />
        ) : (
          <span className="pc-profile-photo-initials" aria-hidden>
            {initialsFromName(displayName) || 'PC'}
          </span>
        )}
      </div>

      <div className="pc-profile-photo-actions">
        <button
          type="button"
          className="pc-btn is-sm is-ghost"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Camera size={14} strokeWidth={1.6} />
          {photoURL ? 'Change photo' : 'Upload photo'}
        </button>
        {photoURL ? (
          <button
            type="button"
            className="pc-btn is-sm is-ghost"
            disabled={busy}
            onClick={() => void onRemove()}
          >
            <Trash2 size={14} strokeWidth={1.6} />
            Remove
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="pc-profile-photo-input"
          onChange={(e) => {
            const file = e.target.files?.[0]
            void onFile(file)
            e.target.value = ''
          }}
        />
      </div>
      {error ? <p className="pc-profile-photo-error">{error}</p> : null}
    </div>
  )
}
