const test = require("node:test");
const assert = require("node:assert/strict");
const { hasAccess } = require("../utils/access");

test("owner has access to their own document", () => {
  const doc = { owner: "user1", sharedWith: [] };
  assert.equal(hasAccess(doc, "user1"), true);
});

test("a user in sharedWith has access", () => {
  const doc = { owner: "user1", sharedWith: ["user2"] };
  assert.equal(hasAccess(doc, "user2"), true);
});

test("an unrelated user does not have access", () => {
  const doc = { owner: "user1", sharedWith: ["user2"] };
  assert.equal(hasAccess(doc, "user3"), false);
});

test("works with Mongoose-like ObjectId values via toString()", () => {
  const doc = {
    owner: { toString: () => "user1" },
    sharedWith: [{ toString: () => "user2" }],
  };
  assert.equal(hasAccess(doc, "user1"), true);
  assert.equal(hasAccess(doc, "user2"), true);
  assert.equal(hasAccess(doc, "user3"), false);
});
