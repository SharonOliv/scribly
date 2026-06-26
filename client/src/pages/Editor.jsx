import api from "../api/axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [notFoundOrDenied, setNotFoundOrDenied] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "unsaved"
  const saveTimeout = useRef(null);

  useEffect(() => {
    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/documents/single/${id}`);
      setDocument(response.data);
    } catch (error) {
      setNotFoundOrDenied(true);
    }
  };

  // Recreate the editor whenever a different document finishes loading,
  // otherwise Tiptap keeps the empty initial content forever.
  const editor = useEditor(
    {
      extensions: [StarterKit, Underline],
      content: document?.content || "",
      onUpdate: () => {
        scheduleSave();
      },
    },
    [document?._id]
  );

  // Accepts the document explicitly instead of reading it from the closure.
  // handleTitleChange calls setDocument() (async) and then this in the same
  // tick, so reading `document` from state here would still see the OLD
  // title - that was the rename bug. Passing it in directly fixes that.
  const scheduleSave = (latestDocument = document) => {
    setSaveStatus("unsaved");
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveDocument(latestDocument), 1200);
  };

  const saveDocument = async (docToSave = document) => {
    setSaveStatus("saving");
    try {
      await api.put(`/documents/${id}`, {
        title: docToSave.title,
        content: editor?.getHTML(),
      });
      setSaveStatus("saved");
    } catch (error) {
      console.log(error);
      setSaveStatus("unsaved");
    }
  };

  const handleTitleChange = (e) => {
    const updated = { ...document, title: e.target.value };
    setDocument(updated);
    scheduleSave(updated);
  };

  if (notFoundOrDenied) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-paper">
        <p className="text-ink">This document doesn't exist, or you don't have access to it.</p>
        <button onClick={() => navigate("/dashboard")} className="text-accent hover:underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-ink-soft">Loading...</p>
      </div>
    );
  }

  const ToolbarButton = ({ active, onClick, children, label }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`px-3 py-1.5 rounded text-sm font-medium transition ${
        active ? "bg-accent text-white" : "text-ink-soft hover:bg-accent-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-ink-soft hover:text-ink text-sm">
            ← Back
          </button>
          <input
            type="text"
            value={document.title}
            onChange={handleTitleChange}
            className="font-display text-lg text-ink flex-1 outline-none bg-transparent"
          />
          <span className="text-xs text-ink-soft w-16 text-right">
            {saveStatus === "saving" ? "Saving..." : saveStatus === "unsaved" ? "Unsaved" : "Saved"}
          </span>
        </div>

        <div className="max-w-3xl mx-auto px-6 pb-2 flex items-center gap-1 flex-wrap">
          <ToolbarButton
            label="Bold"
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            B
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            I
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor?.isActive("underline")}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            U
          </ToolbarButton>
          <span className="w-px h-5 bg-line mx-1" />
          <ToolbarButton
            label="Heading"
            active={editor?.isActive("heading", { level: 1 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            label="Bullet list"
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </ToolbarButton>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white border border-line rounded-lg min-h-[60vh] p-8">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}

export default Editor;
