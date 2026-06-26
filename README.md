# Scribly

A small full-stack document editor: create and edit rich-text documents, import plain-text files into new documents, and share documents with other users.

## Stack

- **Client**: React (Vite), React Router, Tiptap (rich text), Tailwind CSS v4, Axios
- **Server**: Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt, Multer (file uploads)
- **Database**: MongoDB Atlas

## Local setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:

```
PORT=5000
MONGO_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/scribly?retryWrites=true&w=majority"
JWT_SECRET=<a long random string>
CLIENT_URL=http://localhost:5173
```

Generate a `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the server:

```bash
npm run dev
```

### 2. Client

```bash
cd client
npm install
cp .env.example .env
```

`.env` should contain:

```
VITE_API_URL=http://localhost:5000/api
```

Start the client:

```bash
npm run dev
```

Visit `http://localhost:5173`. Sign up for an account (there's no seeded login - registration is open) and you're in.

### 3. Run tests

```bash
cd server
npm test
```

Uses Node's built-in test runner against the standalone access-control and file-import logic - no database or network needed.

## Features

- **Documents**: create, rename, edit, save, reopen. Rich text via Tiptap: bold, italic, underline, H1 headings, bulleted lists, numbered lists. Saves automatically ~1.2s after you stop typing (see the "Saved / Saving... / Unsaved" indicator next to the title).
- **File import**: upload a `.txt` or `.md` file from the dashboard to create a new document from it. **Only `.txt` and `.md` are supported** - other file types are rejected with an error message. Imported content becomes plain-text paragraphs (markdown syntax like `#` or `*` is not parsed); apply real formatting afterward with the toolbar.
- **Sharing**: every document has one owner. The owner can share a document with another *existing* Scribly account by email. The dashboard shows two separate sections - "Owned by you" and "Shared with you" - so the distinction is always visible. Shared users can view and edit; only the owner can share or delete.
- **Auth**: email/password, hashed with bcrypt, JWT issued on login/register and sent as a Bearer token on every API request.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## AI workflow

See [AI_WORKFLOW.md](./AI_WORKFLOW.md).

## Known limitations (deliberately out of scope)

- No real-time collaborative editing (no presence, no concurrent-edit merge) - last write wins.
- Sharing requires the recipient to already have an account; there's no email invite flow.
- File import is plain-text only; no `.docx` parsing.
- No password reset flow.
- Single H1 heading level wired to the toolbar (Tiptap supports H1-H6 under the hood, only H1 has a button).
