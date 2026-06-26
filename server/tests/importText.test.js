const test = require("node:test");
const assert = require("node:assert/strict");
const { textToHtml, titleFromFilename } = require("../utils/importText");

test("splits blank-line-separated text into paragraphs", () => {
  const html = textToHtml("First paragraph.\n\nSecond paragraph.");
  assert.equal(html, "<p>First paragraph.</p><p>Second paragraph.</p>");
});

test("escapes HTML so an uploaded file can't inject markup into a document", () => {
  const html = textToHtml("<script>alert(1)</script>");
  assert.equal(html, "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
});

test("falls back to an empty paragraph for blank input", () => {
  assert.equal(textToHtml("   "), "<p></p>");
});

test("derives a document title from the filename", () => {
  assert.equal(titleFromFilename("Meeting Notes.md"), "Meeting Notes");
  assert.equal(titleFromFilename("draft.txt"), "draft");
});
