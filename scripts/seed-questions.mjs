/**
 * One-time seed: RBSE sample questions → Firestore `questions/`
 *
 * Requires Firebase Admin credentials OR run seed from the app (admin, empty DB).
 *
 * Usage with Firebase CLI (after deploying rules):
 *   npm run seed:questions
 *
 * Prefer in-app: Repository → "Seed sample questions" when the bank is empty.
 */

console.log(`
PaperCraft question seed

  Recommended: sign in as admin, open /app/repository, and click
  "Seed sample questions" when the repository is empty.

  That uses the same QUESTION_SEED data as src/data/question-seed.ts
  via seedQuestions() in src/services/firebase/questions.ts.

  To seed via CLI, use Firebase Admin SDK with a service account, or
  import question-seed documents manually in Firebase Console.
`)
