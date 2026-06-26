# Architecture note

## What this is

A two-service app: a React SPA (`client/`) and an Express API (`server/`), talking over REST + JWT, backed by MongoDB.

```
client (Vite/React) --HTTP/JSON+JWT--> server (Express) --Mongoose--> MongoDB Atlas
```

## Key decisions and why

**MongoDB over a relational store.** Documents are naturally tree-shaped (title, HTML content blob, owner, list of shared user IDs) with no real need for joins beyond "give me this user's owned + shared documents." A document store fit the data better than normalizing rich-text content into relational tables, and it matched what was already scaffolded.

**JWT instead of sessions.** No server-side session store to manage, and it's the more common pattern for a SPA + API split. Token is stored in `localStorage` and attached via an Axios request interceptor rather than copy-pasted into every call site.

**Content stored as Tiptap's HTML output, not a custom JSON schema.** Tiptap can serialize either way. HTML is simpler to store and to reason about for this scope. Tradeoff: it's a little more bytes than a compact JSON AST, and it means we're trusting Tiptap's own HTML to be well-formed - acceptable here since it's the same library reading it back.

**Authorization lives in the route, not in middleware-only or client-side checks.** Every document route re-checks `hasAccess()` (or stricter, owner-only checks for delete/share) against the database record before doing anything - never against whatever the client claims. The two things this protects against directly: someone hand-crafting requests for another user's document ID, and the original code (before I touched it) trusting a client-supplied `owner`/`userId` field. `hasAccess` is pulled into its own module (`server/utils/access.js`) specifically so it's unit-testable without spinning up a database.

**File import is intentionally "dumb."** Uploaded `.txt`/`.md` files become plain-text paragraphs, not parsed Markdown or parsed `.docx` XML. Writing a correct Markdown-to-HTML converter or a `.docx` reader is real scope; faking it with a few regexes would be worse than being upfront that it's plain text. The escaping step (`textToHtml`) also exists for a concrete reason: an uploaded file's content ends up rendered into the editor, so it has to be HTML-escaped on the way in or a file could plant markup into a document.

**Debounced autosave over an explicit save button.** Matches how every comparable product (Docs, Notion) behaves, and it's what "save and reopen" implies for this kind of editor rather than a manual-save model.

## What I prioritized given the time box

1. Correctness of the access-control and auth logic over UI polish - getting "who can see/edit/share what" right matters more than how the share modal looks.
2. Making the riskiest logic (access control, file-import sanitization) unit-testable in isolation, rather than only end-to-end-testable, since that's what's actually catchable by a fast test suite.
3. A coherent but modest visual design (a "paper and ink" theme) over a feature I'd have to half-build, given the file-upload requirement wasn't in the original scaffold I started from.

## What I'd do next with more time

- Real-time updates (so a shared doc reflects the other person's edits without a manual refresh) - currently last-write-wins.
- An email-invite flow for sharing with people who don't have an account yet.
- Optimistic UI for delete/share instead of waiting on the round trip.
- Splitting the large Tiptap bundle (currently one ~700KB chunk) for faster initial load.
