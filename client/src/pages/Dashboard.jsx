import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const fileInputRef = useRef(null);

  const [ownedDocuments, setOwnedDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareTarget, setShareTarget] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get("/documents/mine");
      setOwnedDocuments(response.data.ownedDocuments);
      setSharedDocuments(response.data.sharedDocuments);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const response = await api.post("/documents", { title: "Untitled Document" });
      navigate(`/editor/${response.data._id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setImportError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/documents/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/editor/${response.data._id}`);
    } catch (error) {
      setImportError(error.response?.data?.message || "Couldn't import that file");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document? This can't be undone.")) return;

    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setShareMessage("");

    try {
      await api.post(`/documents/share/${shareTarget._id}`, { email: shareEmail });
      setShareMessage(`Shared with ${shareEmail}`);
      setShareEmail("");
    } catch (error) {
      setShareMessage(error.response?.data?.message || "Couldn't share document");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl text-ink">Scribly</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-soft">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-ink-soft hover:text-ink">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-xl text-ink">Your documents</h2>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".txt,.md"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border border-line text-ink rounded px-4 py-2 text-sm font-medium hover:border-accent/40 transition"
            >
              Import file
            </button>
            <button
              onClick={handleCreateDocument}
              className="bg-accent text-white rounded px-4 py-2 text-sm font-medium hover:bg-accent/90 transition"
            >
              + New document
            </button>
          </div>
        </div>
        <p className="text-xs text-ink-soft mb-8">
          Import accepts .txt or .md files - content comes in as plain text paragraphs; apply
          formatting afterward with the toolbar.
          {importError && <span className="text-red-600 ml-2">{importError}</span>}
        </p>

        {loading ? (
          <p className="text-ink-soft">Loading...</p>
        ) : (
          <>
            <section className="mb-10">
              <h3 className="text-sm font-medium text-ink-soft uppercase tracking-wide mb-3">
                Owned by you
              </h3>
              {ownedDocuments.length === 0 ? (
                <p className="text-ink-soft text-sm border border-dashed border-line rounded-lg p-6 text-center">
                  Nothing here yet. Create your first document to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {ownedDocuments.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between bg-white border border-line rounded-lg px-4 py-3 hover:border-accent/40 transition"
                    >
                      <button
                        onClick={() => navigate(`/editor/${doc._id}`)}
                        className="text-left text-ink font-medium flex-1"
                      >
                        {doc.title}
                      </button>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setShareTarget(doc);
                            setShareMessage("");
                          }}
                          className="text-sm text-accent hover:underline"
                        >
                          Share
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="text-sm text-ink-soft hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-sm font-medium text-ink-soft uppercase tracking-wide mb-3">
                Shared with you
              </h3>
              {sharedDocuments.length === 0 ? (
                <p className="text-ink-soft text-sm border border-dashed border-line rounded-lg p-6 text-center">
                  No one has shared a document with you yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {sharedDocuments.map((doc) => (
                    <button
                      key={doc._id}
                      onClick={() => navigate(`/editor/${doc._id}`)}
                      className="w-full text-left bg-white border border-line rounded-lg px-4 py-3 text-ink font-medium hover:border-accent/40 transition"
                    >
                      {doc.title}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {shareTarget && (
        <div className="fixed inset-0 bg-ink/30 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm border border-line">
            <h3 className="font-display text-lg text-ink mb-1">Share "{shareTarget.title}"</h3>
            <p className="text-sm text-ink-soft mb-4">
              They'll need an existing Scribly account with this email.
            </p>
            <form onSubmit={handleShare} className="space-y-3">
              <input
                type="email"
                required
                placeholder="person@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="w-full border border-line rounded px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              {shareMessage && <p className="text-sm text-ink-soft">{shareMessage}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShareTarget(null)}
                  className="text-sm text-ink-soft px-3 py-2 hover:text-ink"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-accent text-white rounded px-4 py-2 text-sm font-medium hover:bg-accent/90"
                >
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
