import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Sigma } from 'lucide-react'

type Props = {
  value: string
  onChange: (html: string) => void
  ariaLabel?: string
  id?: string
  compact?: boolean
  hindi?: boolean
}

/**
 * TipTap-based rich-text editor. Emits sanitized-on-save HTML strings. Math is
 * typed inline as LaTeX between $…$ and rendered by <RichContent/> on display
 * (kept as source in the editor for easy editing).
 */
export function RichTextEditor({
  value,
  onChange,
  ariaLabel,
  id,
  compact = false,
  hindi = false,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'pc-rte-content pc-serif' + (hindi ? ' pc-print-is-hindi' : ''),
        role: 'textbox',
        'aria-multiline': 'true',
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
        ...(id ? { id } : {}),
      },
    },
  })

  // Sync external value changes (form load, language switch) without echoing
  // back through onUpdate.
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const next = value || ''
    const bothEmpty = next === '' && current === '<p></p>'
    if (next !== current && !bothEmpty) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className={'pc-rte' + (compact ? ' is-compact' : '')}>
      <div className="pc-rte-toolbar" role="toolbar" aria-label="Formatting">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={13} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={13} strokeWidth={2} />
        </ToolbarButton>
        <span className="pc-rte-toolbar-sep" aria-hidden />
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={13} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={13} strokeWidth={2} />
        </ToolbarButton>
        <span className="pc-rte-toolbar-sep" aria-hidden />
        <span className="pc-rte-math-hint" title="Type math as LaTeX between $ signs, e.g. $x^2 + 1$">
          <Sigma size={13} strokeWidth={2} />
          $math$
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={'pc-rte-btn' + (active ? ' is-active' : '')}
      aria-label={label}
      aria-pressed={active}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
