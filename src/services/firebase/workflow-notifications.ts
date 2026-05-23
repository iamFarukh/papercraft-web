import { createNotification, notifyAdmins } from '@/services/firebase/notifications'

export async function notifyPaperSubmitted(opts: {
  paperId: string
  title: string
  teacherName: string
  classLabel: string
  subject: string
}) {
  await notifyAdmins({
    type: 'paper_submitted',
    title: 'Paper submitted for approval',
    message: `${opts.teacherName} submitted ${opts.subject} · ${opts.classLabel} — ${opts.title}`,
    entityId: opts.paperId,
    entityKind: 'paper',
  })
}

export async function notifyPaperApproved(opts: {
  teacherUserId: string
  paperId: string
  title: string
}) {
  await createNotification({
    userId: opts.teacherUserId,
    type: 'paper_approved',
    title: 'Paper approved',
    message: `Your paper “${opts.title}” is approved and ready for official preview.`,
    entityId: opts.paperId,
    entityKind: 'paper',
  })
}

export async function notifyPaperReopened(opts: {
  teacherUserId: string
  paperId: string
  title: string
}) {
  await createNotification({
    userId: opts.teacherUserId,
    type: 'paper_reopened',
    title: 'Paper reopened for editing',
    message: `“${opts.title}” was returned to draft so you can revise and resubmit.`,
    entityId: opts.paperId,
    entityKind: 'paper',
  })
}

export async function notifyPaperReturnedDraft(opts: {
  teacherUserId: string
  paperId: string
  title: string
}) {
  await createNotification({
    userId: opts.teacherUserId,
    type: 'paper_returned_draft',
    title: 'Submission returned to draft',
    message: `“${opts.title}” is back in draft. Review feedback and submit again when ready.`,
    entityId: opts.paperId,
    entityKind: 'paper',
  })
}

export async function notifyBulkImportCompleted(opts: {
  adminUserId: string
  fileName: string
  imported: number
  batchId?: string
}) {
  await createNotification({
    userId: opts.adminUserId,
    type: 'bulk_import_completed',
    title: 'Bulk import completed',
    message: `${opts.imported} questions published from ${opts.fileName}.`,
    entityId: opts.batchId ?? null,
    entityKind: 'import',
  })
}

export async function notifyCurriculumWarning(opts: {
  title: string
  message: string
}) {
  await notifyAdmins({
    type: 'curriculum_warning',
    title: opts.title,
    message: opts.message,
    entityKind: 'curriculum',
  })
}
