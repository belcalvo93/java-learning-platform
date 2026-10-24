# Spec — user-auth-progress

## ADDED Requirements

### Requirement: Optional authentication preserving anonymous local-first operation
The platform SHALL continue to allow full access to lessons, exercises, and evaluations without logging in, storing progress in `localStorage` with the visible notice `"Tu progreso se guarda solo en este navegador"`. Authentication SHALL be strictly optional and additive, synchronizing progress across devices when a user signs in.

#### Scenario: Unauthenticated visitor uses the platform without login barrier
- **WHEN** a visitor opens the platform without signing in
- **THEN** all available lessons and exercises work offline with `localStorage` persistence and no login modal blocks access

#### Scenario: Signed-in user sees synchronized progress and local cache stays updated
- **WHEN** a student signs in with a valid account
- **THEN** the platform loads their cloud progress, merges any local progress without data loss, updates `localStorage` as a local cache, and persists subsequent completions to their account document

### Requirement: Deterministic lossless progress merge between localStorage and account
When a user signs in or registers on a browser that already contains local progress (`javaMasterProgress`, `exercise_${id}_completed`, `evaluationResults`), the system SHALL merge the local state with the remote account document using a monotonic union rule so that no completed lesson, completed exercise, or passed evaluation is ever lost.

#### Scenario: Both localStorage and cloud account have distinct completed items
- **WHEN** `localStorage` has completed lessons `[1, 2]`, exercises `[1, 5]`, and `beginner` evaluation `{ score: 75, passed: true }`, while the cloud account has completed lessons `[2, 3]`, exercises `[5, 9]`, and `beginner` evaluation `{ score: 90, passed: true }`
- **THEN** the merged state saved to both the cloud account and `localStorage` contains completed lessons `[1, 2, 3]`, exercises `[1, 5, 9]`, and `beginner` evaluation `{ score: 90, passed: true }`

#### Scenario: Failed evaluation on one side never overwrites a passed evaluation on the other
- **WHEN** `localStorage` has `intermediate` evaluation `{ score: 60, passed: false }` and the cloud account has `intermediate` evaluation `{ score: 80, passed: true }`
- **THEN** the merged `intermediate` evaluation retains `passed: true` and `score: 80`

### Requirement: Per-user data isolation, minimal data collection, and non-self-assignable admin role
Each authenticated user SHALL only be permitted to read and write their own progress document (`users/{uid}`) containing strictly minimal data (lessons completed, exercises completed, evaluation results, and timestamps — never plaintext passwords or user-submitted Java source code). The `role` field (`"student"` by default, `"admin"` only via server/console) MUST NOT be writable or escalatable by the client, and administrators SHALL only read aggregated non-PII metrics (`stats/global`).

#### Scenario: User attempts to read another user's progress or escalate role to admin
- **WHEN** a client authenticated as `uid_A` attempts to read/write `users/uid_B` or write `role: "admin"` inside `users/uid_A`
- **THEN** the database security rules reject the operation with permission denied

### Requirement: Single-point integration with LessonNav.isLevelAvailable for future level gating
Level availability checks across the platform SHALL continue to flow exclusively through `LessonNav.isLevelAvailable(level)`, which in future changes (`C-15`/`C-19`) will consult the active progress source (merged account state when signed in, or `localStorage` when signed out).

#### Scenario: Level availability queries LessonNav.isLevelAvailable
- **WHEN** the UI renders lesson cards, exercise navigation, or level headers
- **THEN** availability is determined by `LessonNav.isLevelAvailable(level)` backed by the current evaluation/progress state
