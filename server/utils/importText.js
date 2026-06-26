const escapeHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Imports are treated as plain text, not parsed markdown - we deliberately
// don't interpret #, *, -, etc. The user can apply real formatting with the
// editor toolbar after importing. This keeps the import path simple and,
// importantly, safe: nothing in the uploaded file is ever treated as HTML.
const textToHtml = (text) => {
  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${escapeHtml(para).replace(/\r?\n/g, "<br>")}</p>`);

  return paragraphs.length > 0 ? paragraphs.join("") : "<p></p>";
};

const titleFromFilename = (filename) =>
  filename.replace(/\.(txt|md)$/i, "").trim() || "Imported Document";

module.exports = { textToHtml, titleFromFilename };
