# AI workflow note

This is a draft based on what actually happened in my Claude conversation while finishing this project. Edit anything below to match your own experience before submitting - in particular the parts about how you built the *original* scaffold (Login/Dashboard/Editor skeleton) before bringing it to Claude, since that happened before this thread and I'm filling this in from the assistant's side of it.

## Which AI tools I used

Claude (Sonnet 4.6, claude.ai), used conversationally with its code execution environment rather than an IDE-integrated agent - I pasted/uploaded my project, described problems, and pasted code back into my own editor.

## Where it materially sped up the work

- **Finding the real bugs, not just the obvious one.** I asked it to review the project, and it caught several things I hadn't: `App.jsx` referenced `Editor` without importing it (a hard crash), there was no `/register` route at all so no account could ever be created, passwords were stored and compared in plain text, and Tailwind was a listed dependency that was never actually wired into the build. None of these were things I'd specifically asked about.
- **Diagnosing the `/auth/register` 404 fast.** When signup failed, instead of guessing, the read of the error told it exactly what was wrong (request going to the Vite dev server's own port, not the API, meaning the env variable wasn't loaded) - a five-minute fix instead of an open-ended debugging session.
- **Finding the rename bug by reasoning about closures, not by trial and error.** When I reported renaming silently failed, it traced the actual cause: a stale-closure bug where the debounced save function captured the document title from one render behind the latest keystroke, so renames either saved the old title or dropped the last character. That's the kind of bug that's easy to miss reading the code top-to-bottom and easy to find by tracing what each closure actually captures.
- **Scaffolding the file-import and test code in one pass** (multer wiring, the text-to-HTML conversion, the unit tests for it) rather than me writing boilerplate from scratch.

## What I changed or rejected from the AI output

- I asked it to add JWT auth and server-side ownership checks rather than accepting the original trust-the-client-supplied-userId approach the scaffold had - this was Claude's suggestion to fix a real access-control hole, and I kept it, but it's worth noting it changed the API shape (e.g. `GET /api/documents/:userId` became `GET /api/documents/mine`, reading the user from the token instead of the URL).
- [Note here anything you personally rewrote, simplified, or reverted - e.g. styling choices, whether you kept the "paper and ink" visual direction it proposed, or any code you decided to write yourself instead.]

## How I verified correctness, UX quality, and implementation reliability

- **I didn't just trust the code - I had it actually run.** Before handing anything back, the suggested fixes were installed and built (`npm install` + `vite build` for the client, syntax-checked and booted the Express server, and ran the test suite) inside Claude's own sandboxed environment, not just visually reviewed. The Tailwind config in particular was verified by grepping the actual compiled CSS output for the expected utility classes, rather than assuming the v4 `@theme` syntax was correct from memory.
- **I ran it myself end to end** after pulling the code into my own project: installed dependencies, connected the real database, and walked through register → login → create document → rename → format text → import a file → share with a second account → reopen after refresh.
- **The rename bug was caught by me using the feature, not by code review** - I noticed renames weren't sticking, reported it, and that's what triggered the closure-bug investigation above.
- [Add what you personally checked in the deployed version - e.g. testing on a second browser/incognito session to confirm sharing works across two real accounts, checking the Render cold-start behavior, etc.]

## What I'm being careful not to overclaim

This wasn't "vibe coded" end to end - the rename bug, the env-var 404, and the original missing-register-route issue were all real defects that needed verifying against actual program behavior (builds, running the server, reading the literal error message), not just code that looked plausible. The parts I'd flag as needing the most scrutiny if someone is reviewing this: the file-import HTML-escaping (security-relevant, covered by a unit test) and the access-control checks on the document routes (also covered by a unit test, but only at the logic level - not end-to-end against a real database in CI).
